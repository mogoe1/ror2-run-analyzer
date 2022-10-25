import { formatDate } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { debounceTime, finalize, skip, Subject, takeUntil, tap, throttleTime } from 'rxjs';
import { LogEntry } from 'src/app/shared/models/log-entry/LogEntry';
import { PlayerStatsUpdateEntry } from 'src/app/shared/models/log-entry/PlayerStatsUpdateEntry';
import { StageEndEntry } from 'src/app/shared/models/log-entry/StageEndEntry';
import { LogSource } from 'src/app/shared/models/log-source/LogSource';
import { ColorUtils } from 'src/app/shared/utils/ColorUtils';
import { ZoomService } from '../../services/zoom.service';

@Component({
  selector: 'app-damage-lines',
  templateUrl: './damage-lines.component.html',
  styleUrls: ['./damage-lines.component.scss']
})
export class DamageLinesComponent implements AfterViewInit, OnDestroy {
  private _destroyed$: Subject<void> = new Subject<void>();
  private _data: Map<string, [number, number][]> = new Map();
  private _maxDamageDone: number = 0;
  private _latestEntry!: LogEntry;

  private _currentZoom: [number, number] | null = null;
  private _currentMin: number = 0;
  private _currentMax: number = 0;
  private _currentZoomedData: Map<string, [number, number][]> = new Map();

  @Input()
  logSource!: LogSource;

  @Input()
  width: number = 500;

  @Input()
  height: number = 200;

  @Input()
  margin: { top: number, right: number, bottom: number, left: number } = { top: 0, right: 0, bottom: 10, left: 60 };

  @ViewChild('graph', { read: ElementRef })
  graphRootRef!: ElementRef;
  xScale!: d3.ScaleTime<number, number, never>;

  private get innerWidth(): number {
    return this.width - this.margin.left - this.margin.right;
  }

  private get innerHeight(): number {
    return this.height - this.margin.top - this.margin.bottom;
  }

  private get _isZoomed(): boolean {
    return !!this._currentZoom;
  }

  constructor(private _zoomService: ZoomService) { }

  ngAfterViewInit(): void {
    this.logSource.logStream$.pipe(
      takeUntil(this._destroyed$),
      tap((entry: LogEntry) => this._onLogEntry(entry)),
      finalize(() => this._onLogFinished())
    ).subscribe();

    this._zoomService.zoom$.pipe(
      takeUntil(this._destroyed$),
      throttleTime(1000 / 60),
      tap((zoom: [number, number] | null) => this._onZoomedTo(zoom)),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
  }

  private _onLogEntry(logEntry: LogEntry): void {
    this._latestEntry = logEntry;
    if (logEntry instanceof PlayerStatsUpdateEntry) {
      const playerId: string = logEntry.playerId;
      if (!this._data.has(playerId)) {
        this._data.set(playerId, []);
      }

      const data: [number, number][] = this._data.get(playerId)!;
      if (data.length === 0) {
        data.push([0, 0])
      }

      data.push([logEntry.time, logEntry.totalDamageDealt]);
      this._maxDamageDone = this._maxDamageDone < logEntry.totalDamageDealt ? logEntry.totalDamageDealt : this._maxDamageDone;
    }

    if (logEntry instanceof StageEndEntry) {
      this._render();
    }
  }

  private _onZoomedTo(zoom: [number, number] | null) {
    this._currentZoom = zoom;
    if (this._isZoomed) {
      this._currentZoomedData = new Map<string, [number, number][]>();

      this._currentMin = Infinity;
      this._currentMax = -Infinity;

      this._data.forEach((data: [number, number][], playerId: string) => {
        const zoomedData = data.filter((value: [number, number], index: number) => {
          const isInsideZoom: boolean = value[0] >= this._currentZoom![0] && value[0] <= this._currentZoom![1];
          let isLastElementBeforeZoom: boolean = false;
          let isFirstElementAfterZoom: boolean = false;
          if (!isInsideZoom && index > 0) {
            const x: number = data.at(index - 1)![0]
            isFirstElementAfterZoom = x <= this._currentZoom![1] && x >= this._currentZoom![0];
          }
          if (!isInsideZoom && index < (data.length - 1)) {
            const x: number = data.at(index + 1)![0]
            isLastElementBeforeZoom = x >= this._currentZoom![0] && x <= this._currentZoom![1];
          }
          return isInsideZoom || isLastElementBeforeZoom || isFirstElementAfterZoom;
        });
        this._currentZoomedData.set(playerId, zoomedData);
        if (zoomedData.length > 0) {
          this._currentMin = Math.min(this._currentMin, zoomedData.at(0)![1])
          this._currentMax = Math.max(this._currentMax, zoomedData.at(-1)![1])
        }
      })
      this._currentMin = this._currentMin === Infinity ? 0 : this._currentMin;
      this._currentMax = Math.max(this._currentMax, 0);
    }

    this._render();
  }

  private _onLogFinished(): void {
    this._data.forEach((data: [number, number][], playerId: string) => {
      const latestDatapoint: [number, number] = data.at(-1)!;
      if (latestDatapoint[0] <= this._latestEntry.time) {
        data.push([this._latestEntry.time, latestDatapoint[1]]);
      }
    });
    this._render();
    this._render();
  }

  private _render() {
    if (!this._latestEntry) {
      return;
    }

    const start: number = this._isZoomed ? this._currentZoom![0] : 0;
    const end: number = this._isZoomed ? this._currentZoom![1] : this._latestEntry.time;
    const min: number = this._isZoomed ? this._currentMin : 0;
    const max: number = this._isZoomed ? this._currentMax : this._maxDamageDone;

    const graph = d3.select(this.graphRootRef.nativeElement);
    graph.attr('width', this.width);
    graph.attr('height', this.height);

    const yScale = d3.scaleLinear()
      .domain([min, max])
      .range([this.innerHeight, 0]);

    this.xScale = d3.scaleTime()
      .domain([start, end])
      .range([0, this.innerWidth]);

    this._renderLeftAxis(graph, yScale);
    this._renderBottomAxis(graph, this.xScale);
    this._renderLines(graph, this.xScale, yScale);
  }

  private _renderLeftAxis(graph: d3.Selection<any, any, any, any>, yScale: d3.ScaleLinear<any, any, any>): void {
    const groupSelection = graph.selectAll('.leftAxis').data([0]);
    groupSelection.enter()
      .append('g')
      .classed('leftAxis', true)
      .merge(groupSelection as any)
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(yScale));
  }

  private _renderBottomAxis(graph: d3.Selection<any, any, any, any>, xScale: d3.ScaleTime<any, any>): void {
    const axis = d3.axisBottom(xScale)
      .tickFormat((value: any, index: number) => { return formatDate(value * 1000, 'H:mm:ss', 'en-US', 'UTC+0') })

    const groupSelection = graph.selectAll('.bottomAxis').data([0]);
    groupSelection.enter()
      .append('g')
      .classed('bottomAxis', true)
      .merge(groupSelection as any)
      .attr('transform', `translate(${this.margin.left}, ${this.height - this.margin.bottom})`)
      .call(axis);
  }

  private _renderLines(graph: d3.Selection<any, any, any, any>, xScale: d3.ScaleTime<any, any>, yScale: d3.ScaleLinear<any, any, any>): void {
    const dataset = this._isZoomed ? this._currentZoomedData : this._data;
    dataset.forEach((_data: [number, number][], playerId: string) => {
      const groupSelection = graph.selectAll(`.line-group-${playerId}`).data([0]);
      groupSelection.enter()
        .append('g')
        .classed(`line-group-${playerId}`, true)
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

      const line = d3.line()
        .x((d: [number, number]) => xScale(d[0]))
        .y((d: [number, number]) => yScale(d[1]));

      const pathSelection = groupSelection.selectAll('path').data([_data]);
      pathSelection.enter()
        .append("path")
        .style("fill", "none")
        .style("stroke", ColorUtils.hashStringToColor(playerId))
        .style("stroke-width", "2")
        .merge(pathSelection as any)
        .attr("d", line as any);
    });
  }
}
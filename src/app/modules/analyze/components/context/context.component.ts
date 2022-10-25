import { formatDate } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { BrushBehavior } from 'd3';
import { filter, finalize, Subject, takeUntil, tap } from 'rxjs';
import { LogEntry } from 'src/app/shared/models/log-entry/LogEntry';
import { PlayerStatsUpdateEntry } from 'src/app/shared/models/log-entry/PlayerStatsUpdateEntry';
import { StageEndEntry } from 'src/app/shared/models/log-entry/StageEndEntry';
import { LogSource } from 'src/app/shared/models/log-source/LogSource';
import { ColorUtils } from 'src/app/shared/utils/ColorUtils';
import { ZoomService } from '../../services/zoom.service';

@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss']
})
export class ContextComponent implements AfterViewInit, OnDestroy {
  private _destroyed$: Subject<void> = new Subject<void>();
  private _data: Map<string, [number, number][]> = new Map();
  private _maxDamageDone: number = 0;
  private _latestEntry!: LogEntry;
  private _width: number = 500;
  private _height: number = 200;
  private _brushInProgress: boolean = false;
  private _currentXScale: d3.ScaleTime<any, any> | null = null;
  private _currentBrush: any;
  private readonly FACTOR = 10000;

  @Input()
  logSource!: LogSource;

  margin: { top: number, right: number, bottom: number, left: number } = { top: 0, right: 10, bottom: 20, left: 10 };

  @ViewChild('graph', { read: ElementRef })
  graphRootRef!: ElementRef<SVGElement>;

  private get innerWidth(): number {
    return this._width - this.margin.left - this.margin.right;
  }

  private get innerHeight(): number {
    return this._height - this.margin.top - this.margin.bottom;
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
      filter(() => !this._brushInProgress),
      tap((zoom: [number, number] | null) => this._onZoomed(zoom)),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
  }

  private _onZoomed(zoom: [number, number] | null) {
    if (zoom && this._currentXScale && this._currentBrush) {
      const start: number = this._currentXScale(zoom[0] * this.FACTOR) + this.margin.left;
      const end: number = this._currentXScale(zoom[1] * this.FACTOR) + this.margin.left;
      this._currentBrush.move(d3.select(this.graphRootRef.nativeElement), [start, end]);
    }else{
      if(this._currentBrush){
        this._currentBrush.clear(d3.select(this.graphRootRef.nativeElement));
      }
    }

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
    const graph = d3.select(this.graphRootRef.nativeElement);
    this._width = this.graphRootRef.nativeElement.getBoundingClientRect().width;
    this._height = this.graphRootRef.nativeElement.getBoundingClientRect().height;

    graph.attr('width', this._width);
    graph.attr('height', this._height);

    const yScale = d3.scaleLinear()
      .domain([0, this._maxDamageDone])
      .range([this.innerHeight, 0]);

    const xScale = d3.scaleTime()
      .domain([0, this._latestEntry.time * this.FACTOR])
      .range([0, this.innerWidth]);
    this._currentXScale = xScale;

    this._renderBottomAxis(graph, xScale);
    this._renderLines(graph, xScale, yScale);
    this._addBrush(graph, xScale);
  }

  private _addBrush(graph: d3.Selection<any, any, any, any>, xScale: d3.ScaleTime<any, any>): void {
    this._currentBrush = d3.brushX()
      .extent([[this.margin.left, this.margin.top], [this._width - this.margin.right, this._height - this.margin.bottom]])
      .on('start', () => { this._brushInProgress = true })
      .on('end', () => this._brushInProgress = false)
      .on('brush', (event: d3.D3BrushEvent<any>, b: any) => {
        if (event.selection) {
          const start: number = xScale.invert(event?.selection?.[0] as unknown as number - 10).getTime() / this.FACTOR;
          const end: number = xScale.invert(event?.selection?.[1] as unknown as number - 10).getTime() / this.FACTOR;
          this._zoomService.setZoom([start, end]);
        } else {
          this._zoomService.setZoom(null);
        }
      });

    graph.call(this._currentBrush);
  }

  private _renderBottomAxis(graph: d3.Selection<any, any, any, any>, xScale: d3.ScaleTime<any, any>): void {
    const axis = d3.axisBottom(xScale)
      .tickFormat((value: any, index: number) => { return formatDate(value / this.FACTOR * 1000, 'H:mm:ss', 'en-US', 'UTC+0') })

    const groupSelection = graph.selectAll('.bottomAxis').data([0]);
    groupSelection.enter()
      .append('g')
      .classed('bottomAxis', true)
      .merge(groupSelection as any)
      .attr('transform', `translate(${this.margin.left}, ${this._height - this.margin.bottom})`)
      .call(axis);
  }

  private _renderLines(graph: d3.Selection<any, any, any, any>, xScale: d3.ScaleTime<any, any>, yScale: d3.ScaleLinear<any, any, any>): void {

    this._data.forEach((data: [number, number][], playerId: string) => {
      const groupSelection = graph.selectAll(`.line-group-${playerId}`).data([0]);
      groupSelection.enter()
        .append('g')
        .classed(`line-group-${playerId}`, true)
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

      const line = d3.line()
        .x((d: [number, number]) => xScale(d[0] * this.FACTOR))
        .y((d: [number, number]) => yScale(d[1]));

      const pathSelection = groupSelection.selectAll('path').data([data]);
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
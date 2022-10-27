import { formatDate } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { color } from 'd3';
import { concatMap, debounceTime, finalize, skip, Subject, takeUntil, tap, throttleTime } from 'rxjs';
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

  private _latestEntry!: LogEntry;
  private _data: Map<string, [number, number][]> = new Map();
  private _maxDamage: number = 0;

  private _currentFocusBoundaries: [number, number] | null = null;
  private _currentFocusMinDamage: number = 0;
  private _currentFocusMaxDamage: number = 0;
  private _currentDataInFocus: Map<string, [number, number][]> = new Map();
  xScale!: d3.ScaleTime<number, number, never>;

  private _selectorPosition$: Subject<number | null> = new Subject();
  private _damagesAtSelector: { time: number, damgages: { name: string, color: string, damage: number }[] } | null = null;

  private _playerNamesById: Map<string, string> = new Map();

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


  private get innerWidth(): number {
    return this.width - this.margin.left - this.margin.right;
  }

  private get innerHeight(): number {
    return this.height - this.margin.top - this.margin.bottom;
  }

  private get _isFocused(): boolean {
    return !!this._currentFocusBoundaries;
  }

  public get selectorValues(): { time: number, damgages: { name: string, color: string, damage: number }[] } | null {
    return this._damagesAtSelector;
  }

  constructor(private _cd: ChangeDetectorRef, private _zoomService: ZoomService) { }

  ngAfterViewInit(): void {
    this.logSource.logStream$.pipe(
      takeUntil(this._destroyed$),
      tap((entry: LogEntry) => this._onLogEntry(entry)),
      finalize(() => this._onLogFinished())
    ).subscribe();

    this._zoomService.zoom$.pipe(
      takeUntil(this._destroyed$),
      throttleTime(1000 / 60),
      tap((focus: [number, number] | null) => this._onFocus(focus)),
    ).subscribe();

    this._selectorPosition$.pipe(
      takeUntil(this._destroyed$),
      throttleTime(1000 / 60),
      tap((xPosOnGraph: number | null) => this._onSelectorChanged(xPosOnGraph)),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
  }

  private _onLogEntry(logEntry: LogEntry): void {
    this._latestEntry = logEntry;
    if (logEntry instanceof PlayerStatsUpdateEntry) {
      if (!this._playerNamesById.has(logEntry.playerId)) {
        this._playerNamesById.set(logEntry.playerId, logEntry.playerName);
      }
      const playerId: string = logEntry.playerId;
      if (!this._data.has(playerId)) {
        this._data.set(playerId, []);
      }

      const data: [number, number][] = this._data.get(playerId)!;
      if (data.length === 0) {
        data.push([0, 0])
      }

      data.push([logEntry.time, logEntry.totalDamageDealt]);
      this._maxDamage = this._maxDamage < logEntry.totalDamageDealt ? logEntry.totalDamageDealt : this._maxDamage;
    }

    if (logEntry instanceof StageEndEntry) {
      this._render();
    }
  }

  private _onFocus(boundaries: [number, number] | null) {
    this._currentFocusBoundaries = boundaries;
    if (this._isFocused) {
      this._currentDataInFocus = new Map<string, [number, number][]>();

      this._data.forEach((data: [number, number][], playerId: string) => {
        let startIndex = d3.bisector((dataPoint: [number, number]) => dataPoint[0]).right(data, this._currentFocusBoundaries![0]);
        let endIndex = d3.bisector((dataPoint: [number, number]) => dataPoint[0]).left(data, this._currentFocusBoundaries![1]);
        if (startIndex > 0) {
          startIndex--;
        }
        if (endIndex < data.length - 1) {
          endIndex++;
        }
        const zoomedData = data.slice(startIndex, endIndex + 1);
        this._currentDataInFocus.set(playerId, zoomedData);
      });
      const extend: [number, number] | [undefined, undefined] = d3.extent(Array.from(this._currentDataInFocus.values()).flat(), (d: [number, number]) => d[1]);
      this._currentFocusMinDamage = extend[0] || 0;
      this._currentFocusMaxDamage = extend[1] || 0;
    }

    this._render();
  }

  private _onSelectorChanged(xPosOnGraph: number | null) {
    if (xPosOnGraph === null) {
      return;
    }

    const time: number = this.xScale.invert(xPosOnGraph - this.margin.left).getTime();
    this._damagesAtSelector = { time, damgages: [] };
    const dataToWorkOn = this._isFocused ? this._currentDataInFocus : this._data;
    dataToWorkOn.forEach((data: [number, number][], playerId: string) => {
      let index = d3.bisector((dataPoint: [number, number]) => dataPoint[0]).right(data, time);
      index = Math.max(index - 1, 0);
      const damage = data[index][1];
      this._damagesAtSelector!.damgages.push({ name: this._playerNamesById.get(playerId)!, color: ColorUtils.hashStringToColor(playerId), damage })
    });
    this._cd.detectChanges();
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

    const start: number = this._isFocused ? this._currentFocusBoundaries![0] : 0;
    const end: number = this._isFocused ? this._currentFocusBoundaries![1] : this._latestEntry.time;
    const min: number = this._isFocused ? this._currentFocusMinDamage : 0;
    const max: number = this._isFocused ? this._currentFocusMaxDamage : this._maxDamage;

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
    this._addSelectorBehaviour(graph);
  }

  private _addSelectorBehaviour(graph: d3.Selection<any, any, any, any>) {
    graph.
      on('mousemove', (e: MouseEvent, a) => {
        const selectorPos: number = Math.min(Math.max(e.offsetX, this.margin.left), this.width - this.margin.right);
        this._selectorPosition$.next(selectorPos)
        this._renderSelector(graph, selectorPos);
      })
      .on('mouseleave', () => {
        this._selectorPosition$.next(null);
        this._damagesAtSelector = null;
        this._cd.detectChanges();
        this._removeSelector(graph);
      });

  }

  private _renderSelector(graph: d3.Selection<any, any, any, any>, at: number) {
    const line = graph.selectAll('.selector-line').data([0]);
    line.enter()
      .append('rect')
      .classed('selector-line', true)
      .attr('width', 1)
      .attr('height', this.innerHeight)
      .merge(line as any)
      .attr('transform', `translate(${at}, ${this.margin.top})`)
  }

  private _removeSelector(graph: d3.Selection<any, any, any, any>) {
    graph.selectAll('.selector-line').data([]).exit().remove();
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
    const dataset = this._isFocused ? this._currentDataInFocus : this._data;
    dataset.forEach((_data: [number, number][], playerId: string) => {
      const groupSelection = graph.selectAll(`.line-group-${playerId}`).data([0]);
      groupSelection.enter()
        .append('g')
        .classed(`line-group-${playerId}`, true)
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

      const line = d3.line()
        .curve(d3.curveStepBefore)
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
import { formatDate } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { finalize, Subject, takeUntil, tap } from 'rxjs';
import { LogEntry } from 'src/app/shared/models/log-entry/LogEntry';
import { PlayerStatsUpdateEntry } from 'src/app/shared/models/log-entry/PlayerStatsUpdateEntry';
import { StageEndEntry } from 'src/app/shared/models/log-entry/StageEndEntry';
import { LogSource } from 'src/app/shared/models/log-source/LogSource';
import { ColorUtils } from 'src/app/shared/utils/ColorUtils';

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

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.logSource.logStream$.pipe(
      takeUntil(this._destroyed$),
      tap((entry: LogEntry) => this._onLogEntry(entry)),
      finalize(() => this._onLogFinished())
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

    if(logEntry instanceof StageEndEntry){
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
    graph.attr('width', this.width);
    graph.attr('height', this.height);

    const yScale = d3.scaleLinear()
      .domain([0, this._maxDamageDone])
      .range([this.innerHeight, 0]);

    const xScale = d3.scaleTime()
      .domain([0, this._latestEntry.time])
      .range([0, this.innerWidth])

    this._renderLeftAxis(graph, yScale);
    this._renderBottomAxis(graph, xScale);
    this._renderLines(graph, xScale, yScale);
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
      .tickFormat((value: any, index: number) => { return formatDate(value * 1000, 'mm:ss', 'en-US') })

    const groupSelection = graph.selectAll('.bottomAxis').data([0]);
    groupSelection.enter()
      .append('g')
      .classed('bottomAxis', true)
      .merge(groupSelection as any)
      .attr('transform', `translate(${this.margin.left}, ${this.height - this.margin.bottom})`)
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
        .x((d: [number, number]) => xScale(d[0]))
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
import { formatDate } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { concatMap, delay, finalize, of, Subject, takeUntil, tap, timeout } from 'rxjs';
import { StageDictionary } from 'src/app/shared/models/dictionary/StageDictionary';
import { LogEntry } from 'src/app/shared/models/log-entry/LogEntry';
import { RunEndEntry } from 'src/app/shared/models/log-entry/RunEndEntry';
import { StageEndEntry } from 'src/app/shared/models/log-entry/StageEndEntry';
import { StageStartEntry } from 'src/app/shared/models/log-entry/StageStartEntry';
import { LogSource } from 'src/app/shared/models/log-source/LogSource';
import { FocusService } from '../../services/focus.service';

@Component({
  selector: 'app-time-per-stage-bars',
  templateUrl: './time-per-stage-bars.component.html',
  styleUrls: ['./time-per-stage-bars.component.scss']
})
export class TimePerStageBarsComponent implements AfterViewInit, OnDestroy {
  private _destroyed$: Subject<void> = new Subject<void>();
  private _data: StageData[] = [];
  private _latestReceivedTime = 0;
  public hooveredData?: StageData;

  @Input()
  logSource!: LogSource;

  @Input()
  width: number = 500;

  @Input()
  height: number = 200;

  @Input()
  margin: { top: number, right: number, bottom: number, left: number } = { top: 0, right: 0, bottom: 10, left: 30 };

  @ViewChild('graph', { read: ElementRef })
  graphRootRef!: ElementRef;

  private get innerWidth(): number {
    return this.width - this.margin.left - this.margin.right;
  }

  private get innerHeight(): number {
    return this.height - this.margin.top - this.margin.bottom;
  }

  constructor(private _changeDetectorRef: ChangeDetectorRef, private _zoomService: FocusService) { }

  ngAfterViewInit(): void {
    this.logSource.logStream$.pipe(
      takeUntil(this._destroyed$),
      tap((entry: LogEntry) => this._onLogEntry(entry)),
      finalize(() => this._onLogFinished()),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
  }

  private _onLogEntry(logEntry: LogEntry): void {
    this._latestReceivedTime = Math.max(this._latestReceivedTime, logEntry.time);
    if (logEntry instanceof StageStartEntry) {
      this._data.push({ stageName: StageDictionary.getStageDef(logEntry.stageIndex).name, stageStart: logEntry.time });
      this._render();
    }

    if (logEntry instanceof StageEndEntry || logEntry instanceof RunEndEntry) {
      const lastEntry: StageData | undefined = this._data.at(-1)
      if (lastEntry === undefined) {
        throw new Error('Found "StageEnd" without previous "StageStart"');
      }

      lastEntry.stageEnd = logEntry.time;
      this._render();
    }
  }

  private _onLogFinished(): void {
    const lastEntry: StageData | undefined = this._data.at(-1)
    if (lastEntry != undefined && !lastEntry.stageEnd) {
      lastEntry.stageEnd = this._latestReceivedTime;
      this._render();
    }
  }

  private _getYValue(d: StageData): number {
    return (d.stageEnd ?? d.stageStart ?? 0) - (d.stageStart ?? 0);
  }

  private _getXValue(d: StageData): string {
    return this._data.indexOf(d) + '';
  }

  private _render() {
    const graph = d3.select(this.graphRootRef.nativeElement);
    graph.attr('width', this.width);
    graph.attr('height', this.height);


    const yValue = this._getYValue.bind(this);
    const xValue = this._getXValue.bind(this);

    const maxTimeSpend: number = d3.max(this._data, yValue) ?? 0;

    const yScale = d3.scaleLinear()
      .domain([0, maxTimeSpend])
      .range([this.innerHeight, 0]);

    const xScale = d3.scaleBand()
      .domain(this._data.map(xValue))
      .range([0, this.innerWidth])
      .padding(0.2);

    this._renderLeftAxis(graph, yScale);
    this._renderBottomAxis(graph, xScale);
    this._renderBars(graph, xScale, yScale);
  }

  private _renderLeftAxis(graph: d3.Selection<any, any, any, any>, yScale: d3.ScaleLinear<any, any, any>): void {
    const axis = d3.axisLeft(yScale)
      .tickFormat((value: any, index: number) => { return formatDate(value * 1000, 'mm:ss', 'en-US') })

    const groupSelection = graph.selectAll('.leftAxis').data([0]);
    groupSelection.enter()
      .append('g')
      .classed('leftAxis', true)
      .merge(groupSelection as any)
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(axis);
  }

  private _renderBottomAxis(graph: d3.Selection<any, any, any, any>, xScale: d3.ScaleBand<any>): void {
    const axis = d3.axisBottom(xScale)
      .tickFormat((value: any, index: number) => { return (index + 1) + '' })
    const groupSelection = graph.selectAll('.bottomAxis').data([0]);
    groupSelection.enter()
      .append('g')
      .classed('bottomAxis', true)
      .merge(groupSelection as any)
      .attr('transform', `translate(${this.margin.left}, ${this.height - this.margin.bottom})`)
      .call(axis);
  }

  private _renderBars(graph: d3.Selection<any, any, any, any>, xScale: d3.ScaleBand<any>, yScale: d3.ScaleLinear<any, any, any>): void {
    const groupSelection = graph.selectAll('.bars').data([0]);
    groupSelection.enter()
      .append('g')
      .classed('bars', true)
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    const barsSelection = groupSelection.selectAll('rect').data(this._data);
    barsSelection.enter()
      .append('rect')
      .on('mouseenter', (event: MouseEvent, data: StageData) => {
        this.hooveredData = data;
        this._changeDetectorRef.detectChanges();
      })
      .on('mouseleave', (event: MouseEvent, data: StageData) => {
        this.hooveredData = undefined;
        this._changeDetectorRef.detectChanges();
      })
      .on('click', (e: PointerEvent, data: StageData) => {
        this._zoomService.setFocus([data.stageStart || 0, data.stageEnd || 0]);
      })
      .attr('y', () => yScale(0))
      .attr('height', () => this.innerHeight - yScale(0))
      .merge(barsSelection as any)
      .attr('x', (d: StageData) => xScale(this._getXValue(d)) ?? 0)
      // .attr('y', (d: StageData) => yScale(this._getYValue(d)))
      // .attr('height', (d: StageData) => this.innerHeight - yScale(this._getYValue(d)))
      .attr('width', xScale.bandwidth())
      .transition()
      .duration(1000)
      .attr('y', (d: StageData) => yScale(this._getYValue(d)))
      .attr('height', (d: StageData) => this.innerHeight - yScale(this._getYValue(d)))
      .delay(function (d, i) { return (i * 100) });
  }

}

interface StageData {
  stageName?: string;
  stageStart?: number;
  stageEnd?: number
}
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { AbstractDestroyComponent } from 'src/app/shared/directives/AbstractDestroyComponent';
import { ColorUtils } from 'src/app/shared/utils/ColorUtils';
import { waitForAnimationFrame } from 'src/app/shared/utils/delayUntilAnimationFrame';
import { PlayerDamageDataService } from '../../services/player-damage-data.service';
import { PlayerInfoService } from '../../services/player-info.service';

@Component({
  selector: 'app-damage-lines',
  templateUrl: './damage-lines.component.html',
  styleUrls: ['./damage-lines.component.scss']
})
export class DamageLinesComponent extends AbstractDestroyComponent implements AfterViewInit, OnDestroy {
  private _renderSubject: Subject<any> = new Subject<any>();

  private _data: Map<string, [number, number][]> = new Map();
  private _xScale: d3.ScaleTime<number, number, any> = d3.scaleTime();
  private _yScale: d3.ScaleLinear<number, number, any> = d3.scaleLinear();

  private _width: number = 0;
  private _height: number = 0;
  private _margin: { top: number, right: number, bottom: number, left: number } = { top: 0, right: 0, bottom: 10, left: 60 };

  private _currentSelectorPos: number | null = null;
  private _playerDamagesAtSelection: Map<string, number> = new Map();

  @ViewChild('graph', { read: ElementRef })
  graphRootRef!: ElementRef<SVGElement>;

  public get innerWidth(): number {
    return Math.max(this._width - this._margin.left - this._margin.right, 0);
  }

  public get innerHeight(): number {
    return Math.max(this._height - this._margin.top - this._margin.bottom, 0);
  }

  public get yScale(): d3.ScaleLinear<number, number, any> {
    return this._yScale;
  }

  public get xScale(): d3.ScaleTime<number, number, any> {
    return this._xScale;
  }

  public get yAxisTransform(): string {
    return `translate(${this._margin.left}, ${this._margin.top})`
  }

  public get xAxisTransform(): string {
    return `translate(${this._margin.left}, ${this._height - this._margin.bottom})`;
  }

  public get innerContentTransform(): string {
    return `translate(${this._margin.left}, ${this._margin.top})`;
  }

  public get playerIds(): string[] {
    return Array.from(this._data.keys());
  }

  public get renderObservable(): Observable<any> {
    return this._renderSubject.asObservable();
  }

  public get currentSelectorPos(): number | null {
    return this._currentSelectorPos;
  }

  public getDataForPlayer(playerId: string): [number, number][] {
    return this._data.get(playerId) ?? []
  }

  public getPlayerDamageAtSelectorPos(playerId: string) {
    return this._playerDamagesAtSelection.get(playerId);
  }

  constructor(
    private _cd: ChangeDetectorRef, 
    private _playerDamageDataService: PlayerDamageDataService,
    public playerInfoService: PlayerInfoService) {
    super();
  }

  ngAfterViewInit(): void {
    this._playerDamageDataService.dataFocused$.pipe(
      takeUntil(this._destroyed$),
      tap((data) => this._data = data),
      waitForAnimationFrame(),
      tap(() => this._render())
    ).subscribe();
  }

  public onCursorPositionChanged(newPos: number | null) {
    this._currentSelectorPos = newPos;
    if (newPos != null) {
      this._data.forEach((data: [number, number][], playerId: string) => {
        let index = d3.bisector((dataPoint: [number, number]) => dataPoint[0]).right(data, newPos);
        index = Math.max(0, index - 1);
        this._playerDamagesAtSelection.set(playerId, data[index][1]);
      })
    }
  }

  private _updateDimensions() {
    this._width = this.graphRootRef.nativeElement.getBoundingClientRect().width;
    this._height = this.graphRootRef.nativeElement.getBoundingClientRect().height;
  }

  private _updateScales() {
    this._xScale.domain(this._playerDamageDataService.xDomainFocused);
    this._xScale.range([0, this.innerWidth])
    this._yScale.domain(this._playerDamageDataService.yDomainFocused);
    this._yScale.range([this.innerHeight, 0]);
  }


  private _render() {
    this._updateDimensions();
    this._updateScales();

    const graph = d3.select(this.graphRootRef.nativeElement);
    graph.attr('width', this._width);
    graph.attr('height', this._height);

    this._cd.detectChanges();
    this._renderChildren();
  }

  private _renderChildren(): void {
    this._renderSubject.next(null);
  }
}
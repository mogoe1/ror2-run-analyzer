import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { BehaviorSubject, finalize, Observable, take, tap } from 'rxjs';
import { LogEntry } from 'src/app/shared/models/log-entry/LogEntry';
import { PlayerStatsUpdateEntry } from 'src/app/shared/models/log-entry/PlayerStatsUpdateEntry';
import { LogSource } from 'src/app/shared/models/log-source/LogSource';
import { AbstractDataService } from './AbstractDataService';
import { FocusService } from './focus.service';
import { LogSourceProviderService } from './log-source-provider.service';

@Injectable()
export class PlayerDamageDataService extends AbstractDataService{
  private _currentFocusBounds: [number, number] | null = null;

  private _dataSubject: BehaviorSubject<Map<string, [number, number][]>> = new BehaviorSubject(new Map());
  private _data: Map<string, [number, number][]> = new Map();
  private _xDomain: [number, number] = [0, 0];
  private _yDomain: [number, number] = [0, 0];

  private _dataFocusedSubject: BehaviorSubject<Map<string, [number, number][]>> = new BehaviorSubject(new Map());
  private _dataFocused: Map<string, [number, number][]> = new Map();
  private _xDomainFocused: [number, number] = [0, 0];
  private _yDomainFocused: [number, number] = [0, 0];

  public get data$(): Observable<Map<string, [number, number][]>> {
    return this._dataSubject.asObservable();
  }

  public get dataFocused$(): Observable<Map<string, [number, number][]>> {
    return this._dataSubject.asObservable();
  }

  public get xDomain(): [number, number] {
    return this._xDomain;
  }

  public get xDomainFocused(): [number, number] {
    return this._xDomainFocused;
  }

  public get yDomain(): [number, number] {
    return this._yDomain;
  }

  public get yDomainFocused(): [number, number] {
    return this._yDomainFocused;
  }

  public get isFocused(): boolean {
    return this._currentFocusBounds !== null;
  }

  constructor(
    _logSourceProviderService: LogSourceProviderService,
    private _focusService: FocusService,
  ) {
    super(_logSourceProviderService);
    this._focusService.focus$.pipe(
      tap((newBounds: [number, number] | null) => this._onFocusChanged(newBounds))
    ).subscribe();
  }

  protected override _onLogEntry(entry: LogEntry): void {
    super._onLogEntry(entry)
    this._xDomain[1] = Math.max(this._xDomain[1], entry.time);

    if (entry instanceof PlayerStatsUpdateEntry) {
      const playerId: string = entry.playerId;
      if (!this._data.has(playerId)) {
        this._data.set(playerId, []);
      }

      const data: [number, number][] = this._data.get(playerId)!;
      if (data.length === 0) {
        data.push([0, 0])
      }

      data.push([entry.time, entry.totalDamageDealt]);
      this._yDomain[1] = Math.max(this._yDomain[1], entry.totalDamageDealt);

      this._update();
    }
  }

  protected override _onLogFinished(): void {
    super._onLogFinished();
    this._data.forEach((data: [number, number][]) => {
      const latestDatapoint: [number, number] = data.at(-1)!;
      if (latestDatapoint[0] <= this.xDomain[1]) {
        data.push([this.xDomain[1], latestDatapoint[1]]);
      }
    });
    this._update();
  }

  private _onFocusChanged(newBounds: [number, number] | null): void {
    this._currentFocusBounds = newBounds;
    this._update();
  }

  private _update(): void {
    this._dataSubject.next(this._data);
    this._updateFocusData();
    if (this.isFocused) {
      this._dataFocusedSubject.next(this._dataFocused);
    } else {
      this._dataFocusedSubject.next(this._data);
    }
  }

  private _updateFocusData(): void {
    this._dataFocused = new Map<string, [number, number][]>();
    if (!this.isFocused) {
      this._xDomainFocused = this._xDomain;
      this._yDomainFocused = this._yDomain;
      return;
    }

    this._data.forEach((data: [number, number][], playerId: string) => {
      let startIndex = d3.bisector((dataPoint: [number, number]) => dataPoint[0]).right(data, this._currentFocusBounds![0]);
      let endIndex = d3.bisector((dataPoint: [number, number]) => dataPoint[0]).left(data, this._currentFocusBounds![1]);
      startIndex = Math.max(0, startIndex - 1);
      endIndex = Math.min(data.length - 1, endIndex + 1)
      const zoomedData = data.slice(startIndex, endIndex + 1); // +1 to include element at endIndex
      this._dataFocused.set(playerId, zoomedData);
    });
    const yBounds: [number, number] | [undefined, undefined] = d3.extent(Array.from(this._dataFocused.values()).flat(), (d: [number, number]) => d[1]);
    this._yDomainFocused = [yBounds[0] ?? 0, yBounds[1] ?? 0];
    this._xDomainFocused = [this._currentFocusBounds![0], this._currentFocusBounds![1]];
  }

  private getDamagesAt(timestamp: number): Map<string, [number, number]> {
    const result: Map<string, [number, number]> = new Map();
    this._data.forEach((data: [number, number][], playerId: string) => {

      let index = d3.bisector((dataPoint: [number, number]) => dataPoint[0]).right(data, timestamp);
      index = Math.max(0, index - 1);
      result.set(playerId, data.at(index)!)
    });
    return result;
  }

}
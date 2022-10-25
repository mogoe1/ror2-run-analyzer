import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZoomService {
  private _zoom: BehaviorSubject<[number, number] | null> = new BehaviorSubject<any>(null);

  public get zoom$(): Observable<[number, number] | null> {
    return this._zoom.asObservable();
  }

  public setZoom(zoom: [number, number] | null): void {
    this._zoom.next(zoom);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class FocusService {
  private _focus: BehaviorSubject<[number, number] | null> = new BehaviorSubject<any>(null);

  public get focus$(): Observable<[number, number] | null> {
    return this._focus.asObservable();
  }

  public setFocus(bounds: [number, number] | null): void {
    this._focus.next(bounds);
  }
}

import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { LogSource } from 'src/app/shared/models/log-source/LogSource';

@Injectable()
export class LogSourceProviderService {
  private _logSource: ReplaySubject<LogSource> = new ReplaySubject<LogSource>(1);

  public get logSource$(): Observable<LogSource> {
    return this._logSource.asObservable();
  }

  public setLogSourceTo(logSource: LogSource) {
    if (!this._logSource.closed) {
      this._logSource.next(logSource);
      this._logSource.complete();
    }
  }
}

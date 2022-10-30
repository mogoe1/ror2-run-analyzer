import { take, tap, finalize } from "rxjs";
import { LogEntry } from "src/app/shared/models/log-entry/LogEntry";
import { LogSource } from "src/app/shared/models/log-source/LogSource";
import { LogSourceProviderService } from "./log-source-provider.service";

export class AbstractDataService {
    private _logSource!: LogSource;

    constructor(private _logSourceProviderService: LogSourceProviderService) {
        this._logSourceProviderService.logSource$.pipe(
            take(1),
            tap((source: LogSource) => this._logSource = source as LogSource),
            tap(() => this._onLogSourceSet()),
        ).subscribe();
    }

    private _onLogSourceSet(): void {
        this._logSource.logStream$.pipe(
            tap((entry: LogEntry) => this._onLogEntry(entry)),
            finalize(() => this._onLogFinished())
        ).subscribe();
    }

    protected _onLogEntry(entry: LogEntry): void { }

    protected _onLogFinished(): void { }
}
import { concatMap, delay, Observable, of, ReplaySubject } from "rxjs";
import { LogEntry } from "../log-entry/LogEntry";
import { LogEntryFactory } from "../log-entry/LogEntryFactory";
import { LogSource } from "./LogSource";

export class JsonFileLogSource implements LogSource {
    private _source: any;
    private _logStream: ReplaySubject<LogEntry> = new ReplaySubject();
    private _modVersion: string;
    private _logVersion: string;
    private _startDate: Date;

    private _numEntriesParsed: number = 0;

    get logStream$(): Observable<any> {
        return this._logStream.asObservable();
    }

    get modVersion(): string {
        return this._modVersion;
    }

    get logVersion(): string {
        return this._logVersion;
    }

    get startDate(): Date {
        return this._startDate;
    }

    private get _logAvailable(): boolean {
        return !!this._source['log']?.length;
    }
    private get _logFullyParsed(): boolean {
        return this._numEntriesParsed === this._source['log'].length;
    }

    constructor(fileContent: string) {
        this._source = JSON.parse(fileContent);
        this._logVersion = this._source['logVersion'];
        this._modVersion = this._source['modVersion'];
        this._startDate = this._source['timestamp'];

        this._parseLog();
    }

    private _parseLog(deadline?: IdleDeadline): void {
        if (!this._logAvailable || this._logFullyParsed) {
            this._logStream.complete();
            return;
        }

        if (!deadline) {
            requestIdleCallback(this._parseLog.bind(this), { timeout: 5000 });
            return;
        }

        while (deadline.timeRemaining() > 0 || deadline.didTimeout && !this._logFullyParsed) {
            this._parseLogChunck();
        }

        requestIdleCallback(this._parseLog.bind(this), { timeout: 5000 });
    }

    private _parseLogChunck(chunkSize: number = 10): void {
        for (let i = 0; (i < chunkSize && !this._logFullyParsed); i++) {
            const entry: any = this._source['log'][this._numEntriesParsed];
            this._logStream.next(LogEntryFactory.createFromJson(entry));
            this._numEntriesParsed++;
        }
    }
}
import { Observable } from "rxjs";
import { LogEntry } from "../log-entry/LogEntry";

export interface LogSource {
    logStream$: Observable<LogEntry>;
    logVersion: string;
    modVersion: string;
    startDate: Date;
}
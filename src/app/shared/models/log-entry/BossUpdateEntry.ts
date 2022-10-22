import { LogEntry as LogEntry } from "./LogEntry";

export class BossUpdateEntry extends LogEntry {
    public readonly numBossesAlive: number = 0;
    public readonly totalBossesHealth: number = 0;

    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
import { LogEntry as LogEntry } from "./LogEntry";

export class BossSpawnEntry extends LogEntry{
    public readonly bossId: number = 0;
    public readonly bossName: string = '';

    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
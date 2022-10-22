import { LogEntry as LogEntry } from "./LogEntry";

export class BossDeathEntry extends LogEntry{
    public readonly bossId: number = -1;
    public readonly bossName: string = '';

    
    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
import { LogEntry } from "./LogEntry";

export class PlayerDeathEntry extends LogEntry {
    public readonly playerId: string = "";
    public readonly playerName: string = "";
    
    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
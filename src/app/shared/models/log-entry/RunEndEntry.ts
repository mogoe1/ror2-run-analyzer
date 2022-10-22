import { LogEntry } from "./LogEntry";

export class RunEndEntry extends LogEntry {
    public readonly isWin: boolean = false;
    
    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
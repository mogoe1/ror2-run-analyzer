import { LogEntry } from "./LogEntry";

export class TeleporterEndEntry extends LogEntry {
   
    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
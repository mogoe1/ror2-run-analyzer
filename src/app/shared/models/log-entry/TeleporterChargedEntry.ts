import { LogEntry } from "./LogEntry";

export class TeleporterChargedEntry extends LogEntry {
   
    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
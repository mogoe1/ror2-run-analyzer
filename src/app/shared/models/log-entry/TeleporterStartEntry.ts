import { LogEntry } from "./LogEntry";

export class TeleporterStartEntry extends LogEntry {
   
    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
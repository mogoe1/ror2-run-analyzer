import { LogEntry } from "./LogEntry";

export class TeleporterUpdateEntry extends LogEntry {
   public readonly chargedAmount:number = -1;

    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
import { LogEntry } from "./LogEntry";

export class MountainShrineActivatedEntry extends LogEntry{
    constructor(json:any) {
        super();
        this._initializeWith(json);
    }
}
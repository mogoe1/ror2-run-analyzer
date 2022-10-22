import { LogEntry } from "./LogEntry";

export class RunStartEntry extends LogEntry {
    public readonly gameModeIndex: number = -1;
    public readonly hostedBy: string = '';
    public readonly difficulty: number = -1;

    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
import { LogEntry } from "./LogEntry";

export class StageEndEntry extends LogEntry {
    public readonly difficultyCoeff: number = -1;

    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
import { LogEntry } from "./LogEntry";

export class StageStartEntry extends LogEntry {
    public readonly stageIndex: number = -1;
    public readonly difficultyCoeff: number = -1;

    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
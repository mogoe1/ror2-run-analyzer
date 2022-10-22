import { LoadoutSlot } from "../player/LoadoutSlot";
import { LogEntry } from "./LogEntry";

export class PlayerSpawnEntry extends LogEntry {
    public readonly playerId: string = "";
    public readonly playerName: string = "";
    public readonly survivorId: number = 0;
    public readonly survivorName: string = "";
    public readonly loadout: LoadoutSlot[] = [];

    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
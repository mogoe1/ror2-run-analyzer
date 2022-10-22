import { LogEntry } from "./LogEntry";

export class PlayerStatsUpdateEntry extends LogEntry {
    public readonly playerId: string = '';
    public readonly playerName: string = '';
    public readonly totalDamageDealt: number = -1;
    public readonly totalMinionDamageDealt: number = -1;
    public readonly totalKills: number = -1;
    public readonly totalMinionKills: number = -1;
    public readonly highestDamageDealt: number = -1;
    public readonly totalDamageTaken: number = -1;
    public readonly goldCollected: number = -1;
    public readonly totalGoldPurchases: number = -1;
    public readonly currentHealthFraction: number = -1;
    public readonly currentShieldFraction: number = -1;
    public readonly currentBarrierFraction: number = -1;

    constructor(json: any) {
        super();
        this._initializeWith(json);
    }
}
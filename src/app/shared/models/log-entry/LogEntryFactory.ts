import { LogEntry } from "./LogEntry";
import { BossDeathEntry } from "./BossDeathEntry";
import { BossSpawnEntry } from "./BossSpawnEntry";
import { BossUpdateEntry } from "./BossUpdateEntry";
import { ItemDropEntry } from "./ItemDropEntry";
import { ItemPickupEntry } from "./ItemPickupEntry";
import { MountainShrineActivatedEntry } from "./MountainShrineActivatedEntry";
import { PlayerDeathEntry } from "./PlayerDeathEntry";
import { PlayerSpawnEntry } from "./PlayerSpawnEntry";
import { PlayerStatsUpdateEntry } from "./PlayerStatsUpdateEntry";
import { RunEndEntry } from "./RunEndEntry";
import { RunStartEntry } from "./RunStartEntry";
import { StageEndEntry } from "./StageEndEntry";
import { StageStartEntry } from "./StageStartEntry";
import { TeleporterChargedEntry } from "./TeleporterChargedEntry";
import { TeleporterEndEntry } from "./TeleporterEndEntry";
import { TeleporterStartEntry } from "./TeleporterStartEntry";
import { TeleporterUpdateEntry } from "./TeleporterUpdateEntry";

export class LogEntryFactory{
    public static createFromJson(json: any): LogEntry {
        switch(json['type']){
            case 'BOSS_DEATH':
                return new BossDeathEntry(json);
            case 'BOSS_SPAWN':
                return new BossSpawnEntry(json);
            case 'BOSS_UPDATE':
                return new BossUpdateEntry(json);
            case 'ITEM_DROP':
                return new ItemDropEntry(json);
            case 'ITEM_PICKUP':
                return new ItemPickupEntry(json);
            case 'MOUNTAIN_SHRINE_ACTIVATED':
                return new MountainShrineActivatedEntry(json);
            case 'PLAYER_DEATH':
                return new PlayerDeathEntry(json);
            case 'PLAYER_SPAWN':
                return new PlayerSpawnEntry(json);
            case 'RUN_END':
                return new RunEndEntry(json);
            case 'RUN_START':
                return new RunStartEntry(json);
            case 'STAGE_END':
                return new StageEndEntry(json);
            case 'STAGE_START':
                return new StageStartEntry(json);
            case 'STATS_UPDATE':
                return new PlayerStatsUpdateEntry(json);
            case 'TELEPORTER_CHARGED':
                return new TeleporterChargedEntry(json);
            case 'TELEPORTER_END':
                return new TeleporterEndEntry(json);
            case 'TELEPORTER_START':
                return new TeleporterStartEntry(json);
            case 'TELEPORTER_UPDATE':
                return new TeleporterUpdateEntry(json);
            default:
                throw Error('Unknown Event "' + json['type'] + '"');
        }
    }
}
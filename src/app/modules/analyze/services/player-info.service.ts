import { Injectable } from '@angular/core';
import { LogEntry } from 'src/app/shared/models/log-entry/LogEntry';
import { PlayerSpawnEntry } from 'src/app/shared/models/log-entry/PlayerSpawnEntry';
import { ColorUtils } from 'src/app/shared/utils/ColorUtils';
import { AbstractDataService } from './AbstractDataService';
import { LogSourceProviderService } from './log-source-provider.service';

@Injectable()
export class PlayerInfoService extends AbstractDataService {
  private _playerInfosById: Map<string, PlayerInfo> = new Map();

  constructor(
    _logSourceProviderService: LogSourceProviderService,
  ) {
    super(_logSourceProviderService);
  }
  
  public getPlayerInfoById(playerId: string): PlayerInfo | null {
    return this._playerInfosById.get(playerId) ?? null;
  }

  protected override _onLogEntry(entry: LogEntry): void {
    super._onLogEntry(entry);
    if (entry instanceof PlayerSpawnEntry && !this._playerInfosById.has(entry.playerId)) {
      this._playerInfosById.set(entry.playerId, { name: entry.playerName, id: entry.playerId, color: ColorUtils.hashStringToColor(entry.playerId) });
    }
  }
}

export interface PlayerInfo {
  name: string;
  id: string;
  color: string;
}

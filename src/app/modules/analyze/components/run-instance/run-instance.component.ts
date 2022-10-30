import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { LogSource } from 'src/app/shared/models/log-source/LogSource';
import { FocusService } from '../../services/focus.service';
import { LogSourceProviderService } from '../../services/log-source-provider.service';
import { PlayerDamageDataService } from '../../services/player-damage-data.service';
import { PlayerInfoService } from '../../services/player-info.service';

@Component({
  selector: 'app-run-instance',
  templateUrl: './run-instance.component.html',
  styleUrls: ['./run-instance.component.scss'],
  providers: [
    FocusService,
    LogSourceProviderService,
    PlayerDamageDataService,
    PlayerInfoService,
  ]
})
export class RunInstanceComponent implements AfterViewInit{

  @Input()
  logSource!: LogSource;

  constructor(private _logSourceProviderService:LogSourceProviderService){}

  ngAfterViewInit(): void {
    this._logSourceProviderService.setLogSourceTo(this.logSource);
  }

  
}

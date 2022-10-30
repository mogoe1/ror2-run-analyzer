import { Component } from '@angular/core';
import { NgxDropzoneChangeEvent } from 'ngx-dropzone';
import { JsonFileLogSource } from 'src/app/shared/models/log-source/JsonFileLogSource';
import { LogSource } from 'src/app/shared/models/log-source/LogSource';

@Component({
  selector: 'app-analyze-page',
  templateUrl: './analyze-page.component.html',
  styleUrls: ['./analyze-page.component.scss']
})
export class AnalyzePageComponent {
  private _logSources: LogSource[] = [];

  public get logSources(): LogSource[] {
    return this._logSources;
  }

  public async onFileSelected(event: NgxDropzoneChangeEvent) {

    for (let file of event.addedFiles) {
      const content: string = await file.text();
      const name: string = file.name;
      this._logSources.push(new JsonFileLogSource(content, name));
    }
  }

}

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
  private _logSource?: LogSource;

  public get logSource(): LogSource | undefined {
    return this._logSource;
  }

  public async onFileSelected(event: NgxDropzoneChangeEvent) {
    const content: string = await event.addedFiles[0].text();
    this._logSource = new JsonFileLogSource(content);
  }

}

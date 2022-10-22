import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { AnalyzeRoutingModule } from './analyze-routing.module';
import { AnalyzePageComponent } from './pages/analyze-page/analyze-page.component';
import { TimePerStageBarsComponent } from './components/time-per-stage-bars/time-per-stage-bars.component';


@NgModule({
  declarations: [
    AnalyzePageComponent,
    TimePerStageBarsComponent
  ],
  imports: [
    CommonModule,
    AnalyzeRoutingModule,
    NgxDropzoneModule,
  ]
})
export class AnalyzeModule { }

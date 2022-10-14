import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AnalyzeRoutingModule } from './analyze-routing.module';
import { AnalyzePageComponent } from './pages/analyze-page/analyze-page.component';


@NgModule({
  declarations: [
    AnalyzePageComponent
  ],
  imports: [
    CommonModule,
    AnalyzeRoutingModule
  ]
})
export class AnalyzeModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyzePageComponent } from './pages/analyze-page/analyze-page.component';

const routes: Routes = [
  { 
    path: '', 
    component: AnalyzePageComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyzeRoutingModule { }

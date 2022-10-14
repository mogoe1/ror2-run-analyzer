import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'analyze',
    pathMatch: 'full'
  },
  { 
    path: 'analyze', 
    loadChildren: () => import('./modules/analyze/analyze.module').then(m => m.AnalyzeModule) 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

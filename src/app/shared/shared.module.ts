import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3LeftLinearAxisDirective } from './directives/d3/left-linear-axis.directive';
import { D3BottomTimeAxisDirective } from './directives/d3/bottom-time-axis.directive';
import { D3LinePathDirective } from './directives/d3/line-path.directive';
import { D3VerticalMouseMarkerDirective } from './directives/d3/vertical-mouse-marker.directive';



@NgModule({
  declarations: [
    D3BottomTimeAxisDirective,
    D3LeftLinearAxisDirective,
    D3LinePathDirective,
    D3VerticalMouseMarkerDirective,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    D3BottomTimeAxisDirective,
    D3LeftLinearAxisDirective,
    D3LinePathDirective,
    D3VerticalMouseMarkerDirective,
  ]
})
export class SharedModule { }

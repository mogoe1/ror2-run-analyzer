import { formatDate } from '@angular/common';
import { AfterViewInit, Component, Directive, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { Observable, takeUntil, tap } from 'rxjs';
import { AbstractDestroyComponent } from '../AbstractDestroyComponent';

@Directive({
  selector: '[appD3BottomTimeAxis]',
})
export class D3BottomTimeAxisDirective extends AbstractDestroyComponent implements AfterViewInit {

  @Input()
  scale!: d3.ScaleTime<number, number, any>;

  @Input()
  renderObservable!: Observable<any>;


  constructor(private _elemenRef: ElementRef<SVGGElement>) {
    super();
  }

  ngAfterViewInit(): void {
    this.renderObservable.pipe(
      takeUntil(this._destroyed$),
      tap(() => this.render())
    ).subscribe();
  }

  public render(): void {
    const axis = d3.axisBottom(this.scale)
      .tickFormat((value: any) => { return formatDate(value, 'H:mm:ss', 'en-US', 'UTC+0') })

    d3.select(this._elemenRef.nativeElement)
      .call(axis);
  }
}

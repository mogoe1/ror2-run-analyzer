import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { Observable, takeUntil, tap } from 'rxjs';
import { AbstractDestroyComponent } from '../AbstractDestroyComponent';

@Directive({
  selector: '[appD3LeftLinearAxisDirective]',
})
export class D3LeftLinearAxisDirective extends AbstractDestroyComponent implements AfterViewInit {

  @Input()
  scale!: d3.ScaleLinear<number, number, any>

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
    d3.select(this._elemenRef.nativeElement)
      .call(d3.axisLeft(this.scale));
  }
}

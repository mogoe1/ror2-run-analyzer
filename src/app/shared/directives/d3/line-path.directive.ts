import { AfterViewInit, Component, Directive, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { Observable, takeUntil, tap } from 'rxjs';
import { AbstractDestroyComponent } from '../AbstractDestroyComponent';

@Directive({
  selector: '[appD3LinePath]',
})
export class D3LinePathDirective extends AbstractDestroyComponent implements AfterViewInit {

  @Input()
  xScale!: d3.ScaleTime<number, number, any>;

  @Input()
  yScale!: d3.ScaleLinear<number, number, any>;

  @Input()
  data!: [number, number][];

  @Input()
  color!: string;

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
    const line = d3.line()
      .curve(d3.curveStepBefore)
      .x((d: [number, number]) => this.xScale(d[0]))
      .y((d: [number, number]) => this.yScale(d[1]));

    d3.select(this._elemenRef.nativeElement).data([this.data])
      .style("fill", "none")
      .style("stroke", this.color)
      .style("stroke-width", "1")
      .attr("d", line as any);
  }
}

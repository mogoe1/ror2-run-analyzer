import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import * as d3 from 'd3';
import { Subject, takeUntil, tap } from 'rxjs';
import { waitForAnimationFrame } from '../../utils/delayUntilAnimationFrame';
import { AbstractDestroyComponent } from '../AbstractDestroyComponent';

@Directive({
  selector: '[appD3VerticalMouseMarker]'
})
export class D3VerticalMouseMarkerDirective extends AbstractDestroyComponent implements AfterViewInit {
  private _positionChanged$: Subject<[number, number] | null> = new Subject();

  @Input()
  xScale!: d3.ScaleTime<number, number, any>;

  @Input()
  yScale!: d3.ScaleLinear<number, number, any>;

  @Output()
  cursorPosition: EventEmitter<number | null> = new EventEmitter();


  constructor(private _elemenRef: ElementRef<SVGGElement>) {
    super();
  }

  ngAfterViewInit(): void {
    this._setup();
    this._positionChanged$.pipe(
      takeUntil(this._destroyed$),
      waitForAnimationFrame(),
      tap((coords: [number, number] | null) => this._onPositionChanged(coords))
    ).subscribe();
  }

  private _setup(): void {
    d3.select(this._elemenRef.nativeElement)
      .append('rect')
      .classed('D3VerticalMouseMarkerCaptor', true)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'transparent')
      .on('mouseenter', () => {
        d3.select(this._elemenRef.nativeElement).append('rect')
          .classed('D3VerticalMouseMarker', true)
          .attr('pointer-events', 'none')
          .attr('fill', 'red')
          .attr('width', 1)
          .attr('y', 0)
          .attr('height', (this.yScale.range()[0]) - (this.yScale.range()[1]))
      })
      .on('mousemove', (e: MouseEvent, a) => {
        this._positionChanged$.next(d3.pointer(e));
      })
      .on('mouseleave', () => {
        this.cursorPosition.emit(null)
        d3.select(this._elemenRef.nativeElement).select('.D3VerticalMouseMarker')
          .remove();
      })
  }

  private _onPositionChanged(coords: [number, number] | null): void {
    if (coords != null) {
      d3.select(this._elemenRef.nativeElement).select('.D3VerticalMouseMarker')
        .attr('x', coords[0])
        .attr('y', 0)
      this.cursorPosition.emit(this.xScale.invert(coords[0]).getTime())
    } else {
      this.cursorPosition.emit(null)
    }
  }

}

import { MonoTypeOperatorFunction, Observable, OperatorFunction } from "rxjs";

/**
 * Collects values from the source observable and emits the last one on the next requestAnimationFrame callback
 * @param source the source observable
 */
export function waitForAnimationFrame<T>(): MonoTypeOperatorFunction<T> {
    return function <T>(source: Observable<T>) {
        return new Observable(subscriber => {
            let latestValue: T | undefined;
            let requestAnimationFrameScheduled: boolean = false;

            const subscription = source.subscribe({
              next(value) {
                latestValue = value;
                if(!requestAnimationFrameScheduled){
                    window.requestAnimationFrame(()=>rafCalled());
                    requestAnimationFrameScheduled = true;
                }
              },
              error(error) {
                subscriber.error(error);
              },
              complete() {
                subscriber.complete();
              }
            });

            function rafCalled(){
                requestAnimationFrameScheduled = false;
                if(!subscription.closed){
                    subscriber.next(latestValue as any);
                }
            }
      
            return () => subscription.unsubscribe();
          });
    }
}

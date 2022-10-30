import { Component, Injectable, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class AbstractDestroyComponent implements OnDestroy {
    protected _destroyed$: Subject<any> = new Subject();

    ngOnDestroy(): void {
        this._destroyed$.next(null);
    }
}
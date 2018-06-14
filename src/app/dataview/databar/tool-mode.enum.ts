import { EventEmitter } from '@angular/core';

// #region [Interfaces]
export enum ToolMode {
    Selection,
    Click
}
// #endregion

export class ModeTracker {
    // #region [Properties]
    current: ToolMode;
    event: EventEmitter<ToolMode>;
    // #endregion

    // #region [Constructor]
    constructor() {
        this.current = ToolMode.Selection;
        this.event = new EventEmitter<ToolMode>();
        this.event.emit(this.current);
    }
    // #endregion

    // #region [Accessors]
    get selection() { return this.current === ToolMode.Selection }

    get click() { return this.current === ToolMode.Click }
    // #endregion

    // #region [Public Methods]
    update(mode: ToolMode) {
        this.current = mode;
        this.event.emit(this.current);
    }

    cycle() {
        let next: ToolMode;
        switch (+this.current) {
            case ToolMode.Selection:
                next = ToolMode.Click;
                break;
            case ToolMode.Click:
                next = ToolMode.Selection;
                break;
            default:
                console.warn('unexpected state in cycle:', this.current);
                break;
        }
        if (next) this.update(next);
    }
    // #endregion
}
import { EventEmitter } from '@angular/core';
import { LabelSchemeInfo, EventMap } from '../../data-loader/workspace-info';

// #region [Interfaces]
type LabelKey = number | string
// #endregion

export class EventTypeMap {
    // #region [Constants]
    NULL_LABEL = 'Ø'
    // #endregion

    // #region [Variables]
    _emap: EventMap;
    null_label: LabelKey;
    private scheme: LabelSchemeInfo;
    // #endregion

    // #region [Constructor]
    constructor(labelscheme: LabelSchemeInfo) {
        this.scheme = labelscheme;
        this._emap = labelscheme.event_map;
        this.null_label = labelscheme.null_label || 0;
    }
    // #endregion

    // #region [Public Methods]
    get(key: LabelKey) {
        // if null-label, return special string
        if (this.isNull(key)) return this.NULL_LABEL;
        // check if valid key
        key = this.toInt(key);
        if (!(key in this._emap)) { console.warn('unexpected label key:', key) }
        return this._emap[key];
    }
    // #endregion

    // #region [Utility Methods]
    isNull(key: LabelKey): boolean {
        return key == this.null_label
    }
    // #endregion

    // #region [Helper Methods]
    private toInt(key: LabelKey): number {
        if (typeof key === 'string') return parseInt(key);
        else return key;
    }
    // #endregion
}

export class TypeTracker {
    // #region [Variables]

    // #endregion


    // #region [Constructor]
    constructor() {

    }
    // #endregion
}
import { EventEmitter } from '@angular/core';
import { EventMap, LabelKey } from './types/event-types';

// #region [Interfaces]
export interface Label {
    start: number;
    end: number;
    label: number;
    type?: string;
    selected?: boolean;
    id?: number;
}
// #endregion

export class LabelStream {
    // #region [Variables]
    name: string;
    labels: Label[];
    event: EventEmitter<string>;
    emap: EventMap;
    private _type: LabelKey;
    private _i: number;
    // #endregion

    // #region [Constructor]
    constructor(name:string, labels: Label[], emap: EventMap = undefined) {
        this.name = name;
        this.set_labels(labels);
        this.emap = emap;
        this._type = this.emap.initial;
        this.event = new EventEmitter<string>();
        this.event.emit('init');
    }
    // #endregion

    // #region [Accessors]
    get lbl_type() { return this._type }
    // #endregion

    // #region [Label Editting]
    set_labels(labels: Label[]) {
        this.labels = labels.map((lbl,i) => { lbl.id = i; return lbl })
        this._i = this.labels.length;
    }

    remove(lbl: Label) { 
        this.labels = this.labels.filter((l) => { return l.id !== lbl.id })
    }

    add(lbl: Label) {
        if (this.exists(lbl)) {console.warn('this label already exists', lbl); return; }
        lbl.id = this._i;
        this._i++;
        this.labels.push(lbl);
    }
    // #endregion

    // #region [Selected Event Type]
    change_type(type: LabelKey) {
        this._type = type;
        this.event.emit('change-type');
    }
    // #endregion

    // #region [Utility Methods]
    toJSON() {
        let simplify = (lbl) => {return {start: lbl.start, end: lbl.end, label: lbl.label} }
        let lbls = this.labels.map(simplify);
        lbls = this.sort(lbls);
        return JSON.stringify(lbls);
    }
    // #endregion

    // #region [Helper Methods]
    /** checks whether another label with the same start/end time already exists */
    private exists(lbl) {
        let idx = this.labels.findIndex((l) => {
            return l.start === lbl.start 
                && l.end   === lbl.end 
        })
        return (idx > -1)
    }

    /** sorts the labels by their start time */
    private sort(labels) {
        let compare = (a,b) => { return a.start - b.start }
        labels.sort(compare);
        return labels;
    }
    // #endregion
}
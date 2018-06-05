import { DatabarComponent } from './databar.component';
import { EventEmitter } from '@angular/core';
import * as d3 from "d3";

// #region [Interfaces]
export interface Label {
    start: number;
    end: number;
    label: number;
    type?: string;
    selected?: boolean;
    id?: number;
}

interface EventMap {
    [index: number]: string;
}
// #endregion

// #region [Label Streams]
export class LabelStream {
    name: string;
    labels: Label[];
    show: boolean;
    event: EventEmitter<string>;
    emap: EventMap;
    private _i: number;

    constructor(name:string, labels: Label[], emap: EventMap = {}) {
        this.name = name;
        this.labels = labels.map((lbl,i) => { lbl.id = i; return lbl} )
        this._i = this.labels.length;
        this.emap = emap;
        this.show = true;
        this.event = new EventEmitter<string>();
        this.event.emit('init');
    }

    // TODO: move to sensor, instead of label-stream
    toggle() {
        this.show = !this.show;
        this.event.emit('toggle');
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

    /**
     * Checks whether another label with the same start/end time already exists
     */
    private exists(lbl) {
        let idx = this.labels.findIndex((l) => {
            return l.start === lbl.start 
                && l.end   === lbl.end 
        })
        return (idx > -1)
    }
}
// #endregion

export class Labeller {
    // #region [Constructor]
    databar: DatabarComponent
    constructor(databar: DatabarComponent) { this.databar = databar }
    // #endregion

    // #region [Accessors]
    get ls() { return this.databar.labelstream }

    get labels() { return this.databar.labels }

    get x() { return this.databar.x }
    // #endregion

    // #region [Public Methods]
    deselect() {
        for (let l of this.labels) { l.selected = false }
        this.ls.event.emit('deselect');;
    }
    
    select(lbl) {
        console.debug('selected label', lbl);
        // deselect all other labels
        for (let l of this.labels) { l.selected = false }
        // select this event
        lbl.selected = true;
        // redraw labels and add drag-handles
        this.ls.event.emit('select');
    }
    
    move(lbl, target) {
        // if no movement we don't have to compute anything
        if (d3.event.dx === 0) return;
        // side = direction it moved
        let side = (d3.event.dx < 0) ? 'left' : 'right';
        // pixel-coordinate variables
        let p0 = parseInt(target.attr('x'));        // original left edge of label
        let pw  = parseInt(target.attr('width'));   // width of label
        let ps = p0 + d3.event.dx;                  // label start
        let pe = ps + pw;                           // label end
        // data-coordinate variables
        let xs = this.x.invert(ps);
        let xe = this.x.invert(pe);
        let w  = xe - xs;
        // don't allow overlap with other labels
        if (side === 'left') {
            xs = this.overlaps(xs, lbl, side);
            xe = xs + w;
        }
        if (side === 'right') {
            xe = this.overlaps(xe, lbl, side);
            xs = xe - w;
        }
        // update label's new bounds
        lbl.start = xs;
        lbl.end = xe;
        // redraw labels and drag-handles
        this.ls.event.emit('move');
    }
    
    resize(lbl, side: 'left' | 'right') {
        let event = d3.event;
        let dx = this.x.invert(event.x);
        // constraints
        dx = this.min_width(dx, lbl, side);
        dx = this.overlaps(dx, lbl, side);
        // update dragged side
        if (side === 'left') lbl.start = dx;
        if (side === 'right') lbl.end = dx;
        // redraw labels and drag-handles
        this.ls.event.emit('resize');
    }

    delete(lbl) {
        this.ls.remove(lbl);
        this.ls.event.emit('delete');
    }

    add(px: number, label: number) {
        let dx = this.x.invert(px);
        let lbl = { start: dx-250, end: dx+250, label: label } as Label
        if (!this.is_empty(this.ls.emap)) 
            lbl.type = this.ls.emap[label]
        this.ls.add(lbl);
        this.ls.event.emit('add');
    }
    // #endregion

    // #region [Helper Methods]
    private is_empty(emap: EventMap) {
        return Object.keys(emap).length === 0;
    }

    /**
     * ensures that the new width of the label cannot be less than zero
     * (see overlaps() for signature details)
     */
    private min_width(dx: number, lbl: Label, side: 'left' | 'right') {
        if (side === 'left' && dx > lbl.end) dx = lbl.end;
        if (side === 'right' && dx < lbl.start) dx = lbl.start;
        return dx;
    }

    /**
     * checks whether the new label position overlaps with any other labels
     * 
     * @param dx the potential new label position
     * @param lbl the selected label
     * @param side whether moving in the right/left direction
     * @returns updated dx value
     */
    private overlaps(dx: number, lbl: Label, side: 'left' | 'right') {
        for (let l of this.labels) {
            // ignore the selected label
            if (l.selected) continue;
            // check left side overlap 
            if (side === 'left') {
                if (dx > l.start && dx < l.end) dx = l.end;           // overlap (left)
                if (dx < l.start && l.start < lbl.start) dx = l.end;  // consumes (left)
            }
            // check right side overlap
            else {
                if (dx > l.start && dx < l.end) dx = l.start;       // overlap (right)
                if (dx > l.end && lbl.start < l.start) dx = l.start;  // consumes (right)
            }
        }
        return dx;
    }
    // #endregion
}

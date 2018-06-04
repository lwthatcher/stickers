import { DatabarComponent } from './databar.component';
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
// #endregion

export class LabelStream {
    name: string;
    labels: Label[];
    show: boolean;
    private _i: number;

    constructor(name:string, labels: Label[]) {
        this.name = name;
        this.labels = labels.map((lbl,i) => { lbl.id = i; return lbl} )
        this._i = this.labels.length;
        this.show = true;
    }
}


export class Labeller {
    // #region [Constructor]
    databar: DatabarComponent
    constructor(databar: DatabarComponent) { this.databar = databar }
    // #endregion

    // #region [Accessors]
    get labels() { return this.databar.labels }

    get x() { return this.databar.x }
    // #endregion

    // #region [Public Methods]
    deselect() {
        for (let l of this.labels) { l.selected = false }
        this.databar.draw_labels();
        this.databar.clear('handles');
    }
    
    select(lbl) {
        console.debug('selected label', lbl);
        // deselect all other labels
        for (let l of this.labels) { l.selected = false }
        // select this event
        lbl.selected = true;
        // redraw labels and add drag-handles
        this.databar.draw_labels();
        this.databar.draw_handles(lbl);
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
        // move the drawn rectangle to the new position
        target.attr('x', this.x(xs));
        // update the domain position of label
        lbl.start = xs;
        lbl.end = xe;
        // update drag handles
        this.databar.draw_handles(lbl);
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
        this.databar.draw_labels();
        this.databar.draw_handles(lbl);
    }

    delete(lbl) {
        // probably the BAD way to do this...
        const idx = this.find(lbl);
        if (idx !== -1)
            this.labels.splice(idx,1);
        this.deselect();
    }
    // #endregion

    // #region [Helper Methods]
    /**
     * Returns the index for the specified labels
     * 
     * @param lbl the label to find
     */
    private find(lbl) {
        return this.labels.findIndex((l) => {
            return l.start === lbl.start 
                && l.end   === lbl.end 
                && l.label === lbl.label
        })
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

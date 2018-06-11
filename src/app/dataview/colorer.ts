import { DataviewComponent } from './dataview.component'
import { SettingsService, ColorScheme } from '../settings/settings.service';
import * as d3 from "d3";

export interface ColorScale {
    (i:number): any
}

export class Colorer {
    dataview: DataviewComponent;
    labels: CMap;
    lines: CMap;
    // #region [Constructor]
    constructor(dataview: DataviewComponent) {
        this.dataview = dataview;
        this.labels = new CMap(this.scale(this.settings.label_scheme), this.etypes)
        this.lines = new CMap(this.scale(this.settings.line_scheme))
    }
    // #endregion

    // #region [Accessors]
    get settings() { return this.dataview.settings }

    get etypes() { return this.dataview.event_types }
    // #endregion

    scale(scheme: ColorScheme) {
        if (scheme === ColorScheme.Category10) return d3.scaleOrdinal(d3.schemeCategory10);
        if (scheme === ColorScheme.Accent) return d3.scaleOrdinal(d3.schemeAccent);
        if (scheme === ColorScheme.Dark2) return d3.scaleOrdinal(d3.schemeDark2);
        if (scheme === ColorScheme.Paired) return d3.scaleOrdinal(d3.schemePaired);
        if (scheme === ColorScheme.Pastel1) return d3.scaleOrdinal(d3.schemePastel1);
        if (scheme === ColorScheme.Pastel2) return d3.scaleOrdinal(d3.schemePastel2);
    }
}


class CMap {
    NULL_COLOR = "lightgrey"
    colors;
    private scale;
    private null_lbl;

    constructor(scale, events=[], null_lbl="0") {
        this.scale = scale;
        this.null_lbl = null_lbl;
        // setup colors
        this.colors = {};
        this.colors[this.null_lbl] = this.NULL_COLOR;
        for (let e of events) {
            let c = this.scale(e);
            console.log('color', e, c);
            this.colors[e] = c;
        }
    }

    get(lbl) {
        if (lbl === this.null_lbl) return this.NULL_COLOR;
        if (!this.colors[lbl] !== undefined) 
            this.colors[lbl] = this.scale(lbl)
        return this.colors[lbl]
    }

    get values() { return Object.values(this.colors) }

    get entries() {
        return Object.entries(this.colors).map((entry) => { return {key: entry[0], value: entry[1]} })
    }
}
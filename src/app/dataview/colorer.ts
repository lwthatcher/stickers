import { DataviewComponent } from './dataview.component'
import { SettingsService, ColorScheme } from '../settings/settings.service';
import * as d3 from "d3";

// #region [Interfaces]
export interface ColorScale {
    (i:number): any
}

type LabelstreamColorMap = { [name:string]: ColorMap }
// #endregion

export class Colorer {
    dataview: DataviewComponent;
    lines: ColorMap;
    _lbls: LabelstreamColorMap = {};
    // #region [Constructor]
    constructor(dataview: DataviewComponent) {
        this.dataview = dataview;
        this.lines = new ColorMap(this.scale(this.settings.line_scheme))
    }
    // #endregion

    // #region [Accessors]
    get settings() { return this.dataview.settings }

    get etypes() { return this.dataview.event_types }
    // #endregion

    // #region [Public Methods]
    labels(name: string): ColorMap {
        if (!(name in this._lbls)) {
            let emap = this.dataview.labelStreams[name].emap;
            let etypes = emap.event_types();
            let cmap = new ColorMap(this.scale(this.settings.label_scheme), etypes);
            this._lbls[name] = cmap;
        }
        return this._lbls[name]
    }
    // #endregion

    // #region [Helper Methods]
    scale(scheme: ColorScheme) {
        if (scheme === ColorScheme.Category10) return d3.scaleOrdinal(d3.schemeCategory10);
        if (scheme === ColorScheme.Accent) return d3.scaleOrdinal(d3.schemeAccent);
        if (scheme === ColorScheme.Dark2) return d3.scaleOrdinal(d3.schemeDark2);
        if (scheme === ColorScheme.Paired) return d3.scaleOrdinal(d3.schemePaired);
        if (scheme === ColorScheme.Pastel1) return d3.scaleOrdinal(d3.schemePastel1);
        if (scheme === ColorScheme.Pastel2) return d3.scaleOrdinal(d3.schemePastel2);
    }
    // #endregion
}

// #region [Helper Classes]
class ColorMap {
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
            this.colors[e] = this.scale(e.toString());
        }
    }

    get(lbl) {
        lbl = lbl.toString();
        if (lbl == this.null_lbl) return this.NULL_COLOR;
        if (!this.colors[lbl] !== undefined) 
            this.colors[lbl] = this.scale(lbl)
        return this.colors[lbl]
    }

    get entries() {
        return Object.entries(this.colors).map((entry) => { return {key: entry[0], value: entry[1]} })
    }
}
// #endregion
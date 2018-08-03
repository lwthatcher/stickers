import { LabelScheme } from './label-scheme';
import { VideoInfo } from './video-info';
import { DataInfo } from './data-info';


// #region [Interfaces]
export interface TypeMap {
    [index: number]: string;
}

export type LabelKey = string |number
type Info = DataInfo | LabelScheme
// #endregion

export class WorkspaceInfo {
    // #region [Properties]
    _data: Object;
    _labels: Object;
    _video: Object;
    name: string;
    workspace: string;
    _info;
    // #endregion

    // #region [Constructor]
    constructor(info) { 
        this._data = info.data;
        this._labels = info.labels;
        this._video = info.video;
        this._info = info;
        this.workspace = info.workspace;
        this.name = info.workspace.join('.');
    }
    // #endregion

    // #region [Accessors]
    get data(): DataInfo[] {
        return Object.entries(this._data).map(entry => new DataInfo(this, this.toInfo(entry)));
    }

    get videos(): VideoInfo[] {
        return Object.entries(this._video).map(entry => new VideoInfo(this, this.toInfo(entry)));
    }

    get labelschemes(): LabelScheme[] {
        return Object.entries(this._labels).map(entry => new LabelScheme(this, this.toInfo(entry)));
    }

    get energy_data(): DataInfo[] { return this.data.filter((data) => data.isEnergy) }

    get visibleData(): DataInfo[] {
        let visible = (data: DataInfo) => { return !data.hide && !data.isEnergy }
        return this.data.filter(visible);
    }

    get hasVideo(): boolean { return Object.keys(this._video).length > 0 }

    get hasEnergy(): boolean { return Object.keys(this.energy_data).length > 0 }
    // #endregion

    // #region [Public Methods]
    getData(dataset: string): DataInfo {
        return this.data.find((d) => { return d.name === dataset })
    }

    getLabels(name: string): LabelScheme {
        return this.labelschemes.find((d) => { return d.name === name })
    }

    vFlashes(vid: string) {
        if (!(vid in this._video)) return [];
        return this._video[vid].flashes || [];
    }

    EMPTY_SCHEME(name: string)
    EMPTY_SCHEME(name: string, event_map:TypeMap={}): LabelScheme { return new LabelScheme(this, {name, event_map}) }
    // #endregion

    // #region [Helper Methods]
    private toInfo(entry): Info {
        let [dataset, info] = entry;
        info.workspace = this.name;
        info.name = dataset;
        info = this.normalize_properties(info);
        return info;
    }

    private normalize_properties(orignal) {
        let obj = Object.assign({}, orignal);
        for (let key of Object.keys(obj)) {
            if (key.includes('-')) {
                let newkey = key.replace('-', '_');
                obj[newkey] = obj[key];
                delete obj[key];
            }
        }
        return obj;
    }
    // #endregion
}

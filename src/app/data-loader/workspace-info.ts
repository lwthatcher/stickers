import {zip, invert} from '../util/util'

// #region [Interfaces]
export interface TypeMap {
    [index: number]: string;
}

type LabelKey = string |number
type Info = DataInfo | LabelScheme
// #endregion

export class WorkspaceInfo {
    // #region [Properties]
    _data: Object;
    _labels: Object[];
    video: Object[];
    name: string;
    _info;
    // #endregion

    // #endregion [Constructor]
    constructor(info) { 
        this._data = info.data;
        this._labels = info.labels;
        this.video = info.video;
        this._info = info;
        this.name = info.workspace.join('.');
    }
    // #endregion

    // #region [Accessors]
    get data(): DataInfo[] {
        return Object.entries(this._data).map(entry => new DataInfo(this, this.toInfo(entry)));
    }

    get labelschemes(): LabelScheme[] {
        return Object.entries(this._labels).map(entry => new LabelScheme(this, this.toInfo(entry)));
    }

    get visibleData(): DataInfo[] {
        let visible = (data: DataInfo) => { return !data.hide && !data.isEnergy }
        return this.data.filter(visible);
    }

    get hasVideo(): boolean { return Object.keys(this.video).length > 0 }
    // #endregion

    // #region [Public Methods]
    getData(dataset: string): DataInfo {
        return this.data.find((d) => { return d.name === dataset })
    }

    getLabels(name: string): LabelScheme {
        return this.labelschemes.find((d) => { return d.name === name })
    }

    vFlashes(vid: string) {
        if (!(vid in this.video)) return [];
        return this.video[vid].flashes || [];
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

export class DataInfo {
    // #region [Constants]
    static MILLISECONDS = 1000
    // #endregion

    // #region [Properties]
    workspace: string;
    name: string;
    format: string;
    labelled: boolean | string;
    Hz: number;
    channels: string;
    path: string;
    flashes: number[];
    hide: boolean;
    type: string;
    crop?: number[];
    private ws: WorkspaceInfo;
    // #endregion

    // #region [Constructor]
    constructor(ws, info) {
        // provided properties
        this.ws = ws;
        this.workspace = info.workspace;
        this.name = info.name;
        // required properties
        this.format = info.format;
        this.labelled = info.labelled;
        this.Hz = info.Hz;
        this.channels = info.channels;
        this.path = info.path;
        // optional properties
        this.flashes = info.flashes || [];
        this.hide = info.hide || false;
        this.type = info.type || 'data';
        if ('crop' in info) this.crop = info.crop;
    }
    // #endregion

    // #region [Accessors]
    get rate() { return DataInfo.MILLISECONDS / this.Hz }

    get isEnergy() { return this.type === 'energy' }
    // #endregion
}

export class LabelScheme {
    // #region [Constants]
    static NULL_EVENT = 'Ø';
    static NULL_KEY = 0;
    // #endregion

    // #region [Properties]
    workspace: string;
    name: string;
    event_map: TypeMap;
    null_label: LabelKey;
    path?: string;
    video?: string;
    private ws: WorkspaceInfo;
    // #endregion

    // #region [Constructor]
    constructor(ws, info) {
        this.ws = ws;
        this.workspace = info.workspace || ws.name;
        this.name = info.name;
        this.event_map = info.event_map;
        if ("path" in info) this.path = info.path;
        if ("video" in info) this.video = info.video;
        this.null_label = info.null_label || LabelScheme.NULL_KEY;
    }
    // #endregion

    // #region [Accessors]
    get flashes() {
        if (!this.video) return [];
        return this.ws.vFlashes(this.video);
    }

    get hasLabels() { return !!this.path }

    get inv_event_map() { return invert(this.event_map) }
    // #endregion

    // #region [Public Methods]
    sync(dataset: string): [number, number][] {
        let ds = this.ws.getData(dataset);
        if (!ds) return [];
        let zipped = zip(ds.flashes, this.flashes);
        let syncable = zipped.filter((dv) => { let [d,v] = dv; return (d===0 || !!d) && (v===0 || !!v) });
        return syncable.map((dv) => { let [d,v] = dv; return [d,v*1000] }) as [number, number][]
    }

    lblKey(type: string) { return parseInt(this.inv_event_map[type]) }
    // #endregion
}
// #region [Interfaces]
export interface LabelSchemeInfo {
    // passed in params
    workspace?: string;
    name: string;
    // required params
    event_map: TypeMap;
    // optional params
    path?: string;
    video?: string;
    null_label?: LabelKey;
}

export interface TypeMap {
    [index: number]: string;
}

type LabelKey = string |number
type Info = DataInfo | LabelSchemeInfo
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
        return Object.entries(this._data).map(entry => new DataInfo(this.toInfo(entry)));
    }

    get labelschemes(): LabelSchemeInfo[] {
        return Object.entries(this._labels).map(entry => this.toInfo(entry)) as LabelSchemeInfo[]
    }

    get visibleData(): DataInfo[] {
        let visible = (data: DataInfo) => { return !data.hide }
        return this.data.filter(visible);
    }
    // #endregion

    // #region [Public Methods]
    getDataInfo(dataset: string): DataInfo {
        return this.data.find((d) => { return d.name === dataset })
    }
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
    crop?: number[];
    // #endregion

    // #region [Constructor]
    constructor(info) {
        // provided properties
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
        if ('crop' in info) this.crop = info.crop;
    }
    // #endregion
}
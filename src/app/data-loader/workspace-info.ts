export class WorkspaceInfo {
    // #region [Properties]
    _data: Object;
    labels: Object[];
    video: Object[];
    name: string;
    _info;
    // #endregion

    // #endregion [Constructor]
    constructor(info) { 
        this._data = info.data;
        this.labels = info.labels;
        this.video = info.video;
        this._info = info;
        this.name = info.workspace.join('.');
    }
    // #endregion

    // #region [Accessors]
    get data(): DataInfo[] {
        return Object.entries(this._data).map(entry => this.toInfo(entry));
    }

    get visibleData(): DataInfo[] {
        let visible = (data: DataInfo) => { return !data.hide }
        return this.data.filter(visible);
    }
    // #endregion

    // #region [Public Methods]
    getDataInfo(dataset: string): DataInfo {
        let info = this._data[dataset];
        info.workspace = this.name;
        info.name = dataset;
        return info;
    }
    // #endregion

    // #region [Helper Methods]
    private toInfo(entry): DataInfo {
        let [dataset, info] = entry;
        info.workspace = this.name;
        info.name = dataset;
        return info;
    }
    // #endregion
}

// #region [Interfaces]
export interface DataInfo {
    // passed in params
    workspace: string;
    name: string;
    // required params
    format: string;
    labelled: boolean | string;
    Hz: number;
    channels: string;
    path: string;
    // optional params
    flashes?: number[];
    hide?: boolean;
    crop?: number[];
}
// #endregion

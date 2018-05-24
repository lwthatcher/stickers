export class WorkspaceInfo {
    data: Object[];
    labels: Object[];
    video: Object[];
    name: string;
    _workspace: string[];
    _info;

    constructor(info) { 
        this.data = info.data;
        this.labels = info.labels;
        this.video = info.video;
        this._workspace = info.workspace;
        this._info = info;
        this.name = this._workspace.join('.');
    }

    getDataInfo(dataset: string): DataInfo {
        let result = this.data[dataset];
        result.workspace = this.name;
        result.name = dataset;
        return result;
    }
}

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
    visible?: boolean;
    crop?: number[];
}

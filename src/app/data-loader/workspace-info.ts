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
}

export interface DataInfo {
    format: string;
    labelled: boolean | string;
    Hz: number;
    channels: string;
    path: string;
    flashes?: number[];
    visible?: boolean;
    crop?: number[];
}

import { DataInfo } from './data-info';
import { Synchronizer } from '../../util/sync';
import { WorkspaceInfo } from './workspace-info';

export class VideoInfo {
    // #region [Properties]
    workspace: string;
    name: string;
    path: string;
    flashes: number[];
    private info;
    private ws: WorkspaceInfo;
    // #endregion

    // #region [Constructor]
    constructor(ws, info) {
        this.name = info.name;
        this.workspace = info.workspace;
        this.path = info.path;
        this.flashes = info.flashes || [];
        this.ws = ws;
        this.info = info;
    }
    // #endregion

    // #region [Public Methods]
    sync(data: DataInfo): Synchronizer { return new Synchronizer(data.flashes, this.flashes); }
    // #endregion
}
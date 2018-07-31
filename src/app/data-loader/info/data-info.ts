import { WorkspaceInfo } from './workspace-info';
import { Sensor } from '../../dataview/sensors/sensor';

// #region [Interfaces]
export interface SensorLike {
    channel?: string;
    idxs: number[];
}
// #endregion

export class DataInfo {
    // #region [Constants]
    static MILLISECONDS = 1000;
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
        if ('crop' in info)
            this.crop = info.crop;
    }
    // #endregion
    
    // #region [Accessors]
    get rate() { return DataInfo.MILLISECONDS / this.Hz; }
    get isEnergy() { return this.type === 'energy'; }
    // #endregion

    // #region [Public Methods]
    toSensor(i: number): SensorLike {
        let idx_map = Sensor.gen_idx_map(this.channels);
        let channel = this.channels[i];
        let idxs = idx_map.get(i);
        return {channel, idxs}
    }
    // #endregion
}
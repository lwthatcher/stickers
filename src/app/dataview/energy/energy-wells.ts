import { Dataset } from "../../data-loader/dataset";
import { WorkspaceInfo } from "../../data-loader/info/workspace-info";
import { DataInfo } from "../../data-loader/info/data-info";
import { DataloaderService } from "../../data-loader/data-loader.service";
import { EventEmitter } from "@angular/core";
import { Sensor } from "../sensors/sensor";
import * as math from 'mathjs';
import * as d3 from "d3";


// #region [Interfaces]
type EnergyMap = {[name: string]: DataInfo}

interface datum {
    d: number;
    i: number;
}

export interface EnergyUpdate {
    type: string;
    mode?: DisplayMode;
}

export enum DisplayMode {
    Overlayed,
    Stacked
}
// #endregion

export class EnergyWellsTracker {
    // #region [Properties]
    ds: Promise<Dataset>;
    visible: boolean;
    energyMap: EnergyMap;
    event = new EventEmitter<EnergyUpdate>();
    displayMode: DisplayMode;
    workspace: WorkspaceInfo
    private dataloader: DataloaderService;
    private current: DataInfo;
    private overlayedMap = new Map();
    private stackedMap = new Map();
    // #endregion

    // #region [Constructor]
    constructor(dataloader: DataloaderService, workspace: WorkspaceInfo) {
        this.dataloader = dataloader;
        this.workspace = workspace;
        this.visible = false;
        this.energyMap = this.toEnergyMap(workspace.energy_data);
        if (this.availableEnergySets.length > 0) {
            let default_set = this.availableEnergySets[0];
            this.select(default_set);
        }
        this.displayMode = DisplayMode.Stacked;
    }
    // #endregion

    // #region [Accessors]
    get has_energy() { return !!this.ds }

    get availableEnergySets() { return Object.keys(this.energyMap) }

    get data(): Promise<datum[][]> {
        if (!this.has_energy) return Promise.reject('No energy data available.')
        else if (!this.overlayedMap.has(this.name))
            this.overlayedMap.set(this.name, this.overlayedFormat(this.ds))
        return this.overlayedMap.get(this.name);
    }

    get formatted() {
        if (!this.has_energy) return Promise.reject('No energy data available.')
        else if (!this.stackedMap.has(this.name))
            this.stackedMap.set(this.name, this.stackFormat(this.ds))
        return this.stackedMap.get(this.name);
    }

    get channels() { return this.current.channels }

    get short_dims() { return Sensor.short_names(this.channels) }

    get name() { return this.current.name }
    // #endregion

    // #region [Public Methods]
    select(name: string) {
        if (!(name in this.energyMap)) throw ReferenceError('Given name not a valid energy set:' + name);
        console.log('using energy dataset:', name);
        this.current = this.energyMap[name];
        this.ds = this.dataloader.loadDataset(this.energyMap[name]);
        if (!this.overlayedMap.has(name))
            this.overlayedMap.set(name, this.overlayedFormat(this.ds));
        if (!this.stackedMap.has(name))
            this.stackedMap.set(name, this.stackFormat(this.ds));
    }

    toggle() {
        this.visible = !this.visible;
        this.event.emit({type: 'toggle'});
    }

    updateMode(mode: DisplayMode) {
        this.displayMode = mode;
        this.event.emit({type: 'display-mode', mode: mode});
    }

    async at(x) {
        let data = await this.formatted;
        return this.atSycn(x, data);
    }

    atSycn(x, data) {
        let sum = (d) => {
            let result = 0;
            for (let i of this.short_dims) {result += d[i]}
            return result;
        }
        return sum(this.closest(x,data));
    }
    // #endregion

    // #region [Helper Methods]
    private toEnergyMap(infos: DataInfo[]) {
        let result = {}
        for (let info of infos) {
            result[info.name] = info;
        }
        return result;
    }

    private overlayedFormat(dataset) { return dataset.then((ds) => ds.all()) }

    private stackFormat(dataset) {
        return dataset.then((ds) => ds.all())
        .then((axes) => {
            let rowmap = (acc,cur,i) => { acc[this.short_dims[i]] = cur.d; acc.i = cur.i; return acc; }
            return math.transpose(axes).map((row) => row.reduce(rowmap, {}));
        })
    }

    private closest(x, data) {
        let Δi = (d) => Math.abs(d.i - x)
        let i = d3.scan(data, (a,b) => {return Δi(a) - Δi(b) })
        return data[i];
    }
    // #endregion
}
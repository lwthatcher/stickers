import { Dataset } from "../../data-loader/dataset";
import { WorkspaceInfo } from "../../data-loader/info/workspace-info";
import { DataInfo } from "../../data-loader/info/data-info";
import { DataloaderService } from "../../data-loader/data-loader.service";
import { EventEmitter } from "@angular/core";
import { Sensor } from "../sensors/sensor";
import { LazyMap } from "./lazy-map";
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
    visible: boolean;
    energyMap: EnergyMap;
    event = new EventEmitter<EnergyUpdate>();
    displayMode: DisplayMode;
    workspace: WorkspaceInfo;
    private ds: Promise<Dataset>;
    private dataloader: DataloaderService;
    private current: DataInfo;
    private overlayedMap: LazyMap;
    private stackedMap: LazyMap;
    private summedMap: LazyMap;
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
        this.overlayedMap = new LazyMap(() => this.overlayedFormat(this.ds))
        this.stackedMap = new LazyMap(() => this.stackFormat(this.ds))
        this.summedMap = new LazyMap(() => this.summedFormat(this.ds))
    }
    // #endregion

    // #region [Accessors]
    get has_energy() { return !!this.ds }

    get availableEnergySets() { return Object.keys(this.energyMap) }

    get data(): Promise<datum[][]> {
        if (!this.has_energy) return Promise.reject('No energy data available.')
        return this.overlayedMap.get(this.name);
    }

    get formatted() {
        if (!this.has_energy) return Promise.reject('No energy data available.')
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
    }

    toggle() {
        this.visible = !this.visible;
        this.event.emit({type: 'toggle'});
    }

    updateMode(mode: DisplayMode) {
        this.displayMode = mode;
        this.event.emit({type: 'display-mode', mode: mode});
    }

    at(x, data) {
        let sum = (d) => {
            let result = 0;
            for (let i of this.short_dims) {result += d[i]}
            return result;
        }
        return sum(this.closestPoint(x,data));
    }
    // #endregion

    // #region [Formatters]
    private overlayedFormat(dataset) { return dataset.then((ds) => ds.all()) }

    private stackFormat(dataset) {
        return dataset.then((ds) => ds.all())
        .then((axes) => {
            let rowmap = (acc,cur,i) => { acc[this.short_dims[i]] = cur.d; acc.i = cur.i; return acc; }
            return math.transpose(axes).map((row) => row.reduce(rowmap, {}));
        })
    }

    private summedFormat(dataset) {
        return dataset.then((ds) => ds.all())
        .then((axes) => {
            let sum = (row) => {
                let i = row[0].i;
                let d = row.map(d => d.d).reduce((acc,cur) => acc + cur, 0);
                return {d,i}
            }
            return math.transpose(axes).map((row) => sum(row));
        })
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

    private closestPoint(x, data) {
        return this.binarySearch(data, x, 0, data.length-1);
    }

    private binarySearch(d, t, s, e) {
        const m = Math.floor((s+e) / 2)
        if (t == d[m].i) return d[m];
        if (e - 1 === s) return Math.abs(d[s].i - t) > Math.abs(d[e].i - t) ? d[e] : d[s];
        if (t > d[m].i) return this.binarySearch(d,t,m,e);
        if (t < d[m].i) return this.binarySearch(d,t,s,m);
    }
    // #endregion


}
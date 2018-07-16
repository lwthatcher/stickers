import { Dataset } from "../../data-loader/dataset";
import { DataInfo } from "../../data-loader/workspace-info";
import { DataloaderService } from "../../data-loader/data-loader.service";
import { EventEmitter } from "@angular/core";
import { Sensor } from "../sensors/sensor";
import * as math from 'mathjs';

// #region [Interfaces]
type EnergyMap = {[name: string]: DataInfo}

interface datum {
    d: number;
    i: number;
}

interface EnergyUpdate {
    type: string;
}

type FormattedData = any
// #endregion

export class EnergyWellsTracker {
    // #region [Properties]
    ds: Promise<Dataset>;
    visible: boolean;
    energyMap: EnergyMap;
    event$ = new EventEmitter<EnergyUpdate>();
    private dataloader: DataloaderService;
    private current: DataInfo;
    // #endregion

    // #region [Constructor]
    constructor(dataloader: DataloaderService,energySets: DataInfo[]) {
        this.dataloader = dataloader;
        this.visible = false;
        this.energyMap = this.toEnergyMap(energySets);
        if (this.availableEnergySets.length > 0) {
            let default_set = this.availableEnergySets[0];
            this.select(default_set);
        }
    }
    // #endregion

    // #region [Accessors]
    get has_energy() { return !!this.ds }

    get availableEnergySets() { return Object.keys(this.energyMap) }

    get data(): Promise<datum[][]> {
        if (this.has_energy)
            return this.ds.then((ds) => { return ds.all() })
        else return Promise.resolve([])
    }

    get formatted() {
        if (!this.has_energy) return Promise.reject('No energy data available.')
        else return this.ds.then((ds) => { return ds.all()})
        .then((axes) => {
            let sd = this.short_dims;
            let ax2 = math.transpose(axes);
            let rowmap = (acc,cur,i) => { acc[sd[i]] = cur; return acc; }
            let data = ax2.map((row) => row.reduce(rowmap, {}))
            return data;
        })
    }

    get channels() { return this.current.channels }

    get short_dims() { return Sensor.short_names(this.channels) }
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
        this.event$.emit({type: 'toggle'});
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
    // #endregion
}
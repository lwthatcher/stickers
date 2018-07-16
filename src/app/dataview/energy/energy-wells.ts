import { Dataset } from "../../data-loader/dataset";
import { DataInfo } from "../../data-loader/workspace-info";
import { DataloaderService } from "../../data-loader/data-loader.service";
import { EventEmitter } from "@angular/core";

// #region [Interfaces]
type EnergyMap = {[name: string]: DataInfo}

interface datum {
    d: number;
    i: number;
}

interface EnergyUpdate {
    type: string;
}
// #endregion

export class EnergyWellsTracker {
    // #region [Properties]
    ds: Promise<Dataset>;
    visible: boolean;
    energyMap: EnergyMap;
    event$ = new EventEmitter<EnergyUpdate>();
    private dataloader: DataloaderService;
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
    // #endregion

    // #region [Public Methods]
    select(name: string) {
        if (!(name in this.energyMap)) throw ReferenceError('Given name not a valid energy set:' + name);
        console.log('using energy dataset:', name);
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
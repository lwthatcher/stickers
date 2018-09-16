import { DataloaderService } from "../../data-loader/data-loader.service";
import { WorkspaceInfo } from "../../data-loader/info/workspace-info";
import { DataInfo } from "../../data-loader/info/data-info";
import { Dataset } from "../../data-loader/dataset";
import { EventEmitter } from "@angular/core";


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

export class EnergyGradientTracker {

    // #region [Properties]
    visible: boolean;
    energyMap: EnergyMap;
    event = new EventEmitter<EnergyUpdate>();
    displayMode: DisplayMode;
    workspace: WorkspaceInfo;
    private ds: Promise<Dataset>;
    private dataloader: DataloaderService;
    private current: DataInfo;
    // #endregion

    // #region [Constructor]
    constructor(dataloader: DataloaderService, workspace: WorkspaceInfo) {
        this.dataloader = dataloader;
        this.workspace = workspace;
        this.visible = false;
        this.energyMap = this.toEnergyMap(workspace.gradient_data);
        if (this.availableEnergySets.length > 0) {
            let default_set = this.availableEnergySets[0];
            this.select(default_set);
        }
    }
    // #endregion

    // #region [Accessors]
    get exists() { return !!this.ds }

    get availableEnergySets() { return Object.keys(this.energyMap) }

    get data(): Promise<datum[][]> {
        return Promise.resolve([])
    }

    get formatted() { return }

    get short_dims() { return  }

    get name() { return this.current.name }
    // #endregion

    // #region [Public Methods]
    select(name: string) {
        if (!(name in this.energyMap)) 
            throw ReferenceError('Given name not a valid energy-gradient set:' + name);
        console.log('using energy-gradient dataset:', name);
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

    atSycn(x, data) {

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
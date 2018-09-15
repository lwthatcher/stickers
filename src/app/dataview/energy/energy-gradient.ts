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
    }
    // #endregion

    // #region [Accessors]
    get has_energy() { return }

    get availableEnergySets() { return }

    get data(): Promise<datum[][]> {
        return Promise.resolve([])
    }

    get formatted() { return }

    get channels() { return  }

    get short_dims() { return  }

    get name() { return }
    // #endregion

        // #region [Public Methods]
        select(name: string) { }
    
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

        }
        // #endregion
}
import { Dataset } from "../../data-loader/dataset";
import { DataInfo } from "../../data-loader/workspace-info";

export class EnergyWellsTracker {
    // #region [Properties]
    ds: Promise<Dataset>;
    visible: boolean;
    energySets: DataInfo[];
    // #endregion

    // #region [Constructor]
    constructor(energySets: DataInfo[]) {
        this.energySets = energySets;
    }
    // #endregion

    // #region [Accessors]
    get has_energy() { return !!this.ds }

    get data() {
        if (this.has_energy)
            return this.ds.then((ds) => { return ds.all() })

    }
    // #endregion

    // #region [Public Methods]
    set(dataset: Promise<Dataset>) {
        this.ds = dataset;
    }
    // #endregion
}
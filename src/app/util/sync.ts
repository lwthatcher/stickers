import { zip } from "./util"

export class Synchronizer {
    // #region [Constructor]
    private syncs: [number,number][];
    constructor(df: number[], vf: number[]) {
        let zipped = zip(df, vf);
        let syncable = zipped.filter(this.syncable);
        this.syncs = syncable.map(this.scaleVideoTime) as [number,number][];
    }
    // #endregion

    // #region [Callbacks]
    private get syncable() { return (dv) => { let [d,v] = dv; return (d===0 || !!d) && (v===0 || !!v) }}

    private get scaleVideoTime() { return (dv) => { let [d,v] = dv; return [d,v*1000] } }
    // #endregion

    // #region [Public Methods]
    get canSync() { return !!this.syncs.length }

    public vidToData(value: number) {
        if (!this.canSync) throw ReferenceError('cannot convert: no values to sync!');
        let [d,v] = this.syncs[0];
        let offset = d - v;
        return (value*1000) + offset;
    }

    public dataToVid(value: number) {
        if (!this.canSync) throw ReferenceError('cannot convert: no values to sync!');
        let [d,v] = this.syncs[0];
        let offset = d - v;
        return (value - offset) / 1000;
    }
    // #endregion
}
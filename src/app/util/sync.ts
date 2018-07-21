export class Synchronizer {
    // #region [Constructor]
    private syncs: [number,number][];
    constructor(syncs: [number,number][]) {
        this.syncs = syncs;
    }
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
        return value - offset;
    }
    // #endregion
}
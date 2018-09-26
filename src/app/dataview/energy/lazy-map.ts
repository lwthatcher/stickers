export class LazyMap {
    // # region [Variables]
    private callback;
    private map = new Map();
    // #endregion

    // #region [Constructor]
    constructor(callback) {
        this.callback = callback;
    }
    // #endregion

    // #region [Public Methods]
    get(name: string) {
        if (!this.map.has(name))
            this.map.set(name, this.callback(name));
        return this.map.get(name);
    }
    // #endregion
}
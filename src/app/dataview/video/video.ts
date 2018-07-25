import { VideoComponent } from "./video.component";
import { VgAPI } from "videogular2/core";
import { Synchronizer } from "../../util/sync";


export class VideoTracker {
    // #region [Properties]
    sync: Synchronizer;
    api: VgAPI;
    private _comp: VideoComponent;
    // #endregion

    // #region [Constructor]
    constructor(videoComponent: VideoComponent) {
        if (!videoComponent) {  
            this.api = undefined;
            this.sync = undefined;
            console.debug('no video available', this);
            return;
        }
        this._comp = videoComponent;
        this.api = videoComponent.api;
        this.sync = videoComponent.sync;
        if (!this.api) console.warn('Video API does not seem to be initialized:', this.api, this._comp);
        console.debug('Video Tracker', this);
    }
    // #endregion

    // #region [Accessors]
    get dt() { return this.sync.vidToData(this.api.currentTime) }

    get vt() { return this.api.currentTime }

    get defined() { return !!this.api }

    get subscriptions() { return this.api.getDefaultMedia().subscriptions }

    get canPlay() {
        if (!this.api) return false;
        else return this.api.canPlay;
    }
    // #endregion
}
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
        this._comp = videoComponent;
        this.api = videoComponent.api;
        this.sync = videoComponent.sync;
        if (!!this.api) console.warn('Video API does not seem to be initialized:', this.api, this._comp);
        console.debug('Video Tracker', this);
    }
    // #endregion


}
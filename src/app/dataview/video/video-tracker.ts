import { VideoComponent } from "./video.component";
import { VgAPI } from "videogular2/core";
import { Synchronizer } from "../../util/sync";
import { EventEmitter } from "@angular/core";


export class VideoTracker {
    // #region [Properties]
    sync: Synchronizer;
    api: VgAPI;
    syncChange: EventEmitter<number> = new EventEmitter();
    private vc: VideoComponent;
    // #endregion

    // #region [Constructor]
    constructor(videoComponent: VideoComponent) {
        if (!videoComponent) {  
            this.api = undefined;
            this.sync = undefined;
            console.debug('no video available', this);
            return;
        }
        this.vc = videoComponent;
        this.api = videoComponent.api;
        this.sync = videoComponent.sync;
        this.vc.flashSync.subscribe((sync: Synchronizer) => {
            this.sync = sync;
            if (sync.canSync) { this.syncChange.emit(this.api.currentTime); }
        })
        if (!this.api) console.warn('Video API does not seem to be initialized:', this.api, this.vc);
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
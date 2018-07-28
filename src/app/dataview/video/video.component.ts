import { Component, OnInit, Input, ElementRef, ChangeDetectorRef, AfterViewChecked, HostListener, Output, EventEmitter } from '@angular/core';
import { WorkspaceInfo, DataInfo, VideoInfo } from '../../data-loader/workspace-info';
import { VgAPI } from 'videogular2/core';
import { Synchronizer } from '../../util/sync';
import { zip } from '../../util/util';
import { SettingsService } from '../../settings/settings.service';
import { SaverService } from '../../saver/saver.service';

// #region [Interfaces]
interface FlashInfo {
  video: number;
  data: number;
  i: number;
  computed?: boolean;
  inVideo?: boolean;
  marked?: boolean
}

// #endregion

// #region [Constants]
const FPS = 30
const FRAME = 1 / FPS
const JUMP = 10

const UNIT = {video: 's', data: 'ms'}
const PRECISION = {video: 4, data: 0}
// #endregion

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, AfterViewChecked {
  // #region [Properties]
  videoElement: HTMLVideoElement;
  api: VgAPI;
  video: VideoInfo;
  sync: Synchronizer;
  origSynced: boolean;
  allFlashes: FlashInfo[]
  preload: string = 'auto';
  expanded: boolean = true;
  rates = ['0.25', '0.5', '1.0', '1.5', '2.0'];
  // #endregion

  // #region [Inputs]
  @Input() workspace: WorkspaceInfo;
  @Input() dataInfo: DataInfo;
  // #endregion

  // #region [Outputs]
  @Output() flashSync = new EventEmitter();
  // #endregion

  // #region [Constructors]
  constructor(private el: ElementRef, 
              private cdRef:ChangeDetectorRef,
              private settings: SettingsService,
              private saver: SaverService) { }

  ngOnInit() {
    console.groupCollapsed('video component init');
    // select default video
    this.video = this.videos[0];
    this.sync = this.video.sync(this.dataInfo);
    this.origSynced = this.sync.canSync;
    this.videoElement = this.el.nativeElement.querySelector('vg-player > video');
    this.allFlashes = this.combineFlashInfo();
    console.info('video component init', this);
    console.groupEnd();
  }

  /** This prevents errors from changing the playback rate */
  ngAfterViewChecked() { this.cdRef.detectChanges() }
  // #endregion

  // #region [Accessors]
  get w() { return this.api.videogularElement.clientWidth }
  get h() { return this.api.videogularElement.clientHeight }
  get videos() { return this.workspace.videos }
  get name() { return this.video.name }
  get src() { return 'video/' + this.video.path }
  get hasFlashes() { return this.video.flashes.length > 0 }
  // #endregion

  // #region [Queries]
  t(flash: FlashInfo, ds: 'video' | 'data') {
    let [time, unit, precision] = [flash[ds], UNIT[ds], PRECISION[ds]]
    if (!this.defined(time)) return "N/A";
    else return time.toFixed(precision) + ' ' + unit;
  }

  hasBoth(flash: FlashInfo): boolean {
    return this.defined(flash.data) && this.defined(flash.video);
  }

  flashClass(flash: FlashInfo, ds: 'video' | 'data') {
    let result = {"flash-info": true, "flex-fill": true, "align-self-center": true}
    result['computed'] = ds === 'video' && flash.computed;
    if ('inVideo' in flash) {
      result['in-video'] = flash.inVideo;
      result['not-in-video'] = !flash.inVideo;
    }
    return result;
  }
  // #endregion

  // #region [Public Methods]
  jumpTo(time: number) { if (this.defined(time)) this.api.seekTime(time) }

  markFlash(flash: FlashInfo) {
    // get current time in video
    let time = this.api.currentTime;
    console.log('marking flash at:', time, flash.i);
    // update video flashes
    this.video.flashes = [];  // reset to allow users to remark
    this.video.flashes[flash.i] = time;
    // update synchronizer, infer flashes based on input
    this.sync = this.video.sync(this.dataInfo);
    this.allFlashes = this.combineFlashInfo().map((f) => this.checkInVideo(f));
    // emit updated synchronizer
    this.flashSync.emit(this.sync);
    // save flashes
    if (this.settings.auto_save) {
      let response = this.saver.saveFlashes(this.video.flashes);
      response.subscribe((r) => {console.debug('save flashes response:', r)})
    }
  }
  // #endregion

  // #region [Event Handlers]
  onPlayerReady(api: VgAPI) {
    this.api = api;
    this.api.getDefaultMedia().subscriptions.durationChange.subscribe(() => {
      console.debug('duration change', this.api.duration);
      this.allFlashes = this.allFlashes.map((flash) => this.checkInVideo(flash));
    })
    console.log('video player ready', this.api);
  }

  @HostListener('document:keydown', ['$event'])
  keypress(event) {
    let key = event.key;
    console.debug('keypress', key, event.target.tagName);
    if (event.target.tagName === 'INPUT' || key === 'i') return;
    if (key === ' ') this.toggle();
    else if (key === 'ArrowRight') this.skip(FRAME, '+');
    else if (key === 'ArrowLeft') this.skip(FRAME, '-');
    else if (key === 'l') this.skip(JUMP, '+');
    else if (key === 'j') this.skip(JUMP, '-');
    else if (key === 'ArrowUp') this.playback('+');
    else if (key === 'ArrowDown') this.playback('-');
    if (event.target.tagName === 'BODY') return false;
  }
  // #endregion

  // #region [Video Helper Methods]
  private toggle() {
    if (this.api.state == 'paused') this.api.play();
    else this.api.pause();
  }

  private skip(Δt, dir: '+' | '-') {
    let [t, dt] = [this.api.currentTime, this.api.currentTime]
    if (dir === '+') dt = Math.min(t+Δt, this.api.duration);
    if (dir === '-') dt = Math.max(t-Δt, 0);
    this.api.seekTime(dt)
  }

  private playback(dir: '+' | '-') {
    let target = (rate) => rate == this.api.playbackRate;
    let [i, di] = [this.rates.findIndex(target), 0];
    if (i === -1) console.warn('unexpected playback rate:', this.api.playbackRate, this.rates);
    if (dir === '+') di = Math.min(i+1, this.rates.length-1);
    if (dir === '-') di = Math.max(i-1, 0);
    this.api.playbackRate = this.rates[di];
  }
  // #endregion

  // #region [Flash Helper Methods]
  private combineFlashInfo(): FlashInfo[] {
    let flashInfo = (dv, i) => {let [d,v] = dv; return {data: d, video: v, i, computed: false} }
    let zipped = zip(this.dataInfo.flashes, this.video.flashes);
    let result = zipped.map(flashInfo);
    return result.map((flash) => this.inferSyncable(flash));
  }

  private defined(time) { return !(time === null || time === undefined) }

  private inferSyncable(flash: FlashInfo): FlashInfo {
    if (!this.defined(flash.video) && this.sync.canSync) {
      flash.video = this.sync.dataToVid(flash.data);
      flash.computed = true;
    }
    return flash;
  }

  private checkInVideo(flash: FlashInfo): FlashInfo {
    if (this.defined(flash.video)) {
      if (flash.video > 0 && flash.video < this.api.duration) flash.inVideo = true;
      else flash.inVideo = false;
    }
    return flash;
  }
  // #endregion
}

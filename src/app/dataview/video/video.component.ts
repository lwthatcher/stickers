import { Component, OnInit, Input, ElementRef, ChangeDetectorRef, AfterViewChecked, HostListener } from '@angular/core';
import { WorkspaceInfo, DataInfo, VideoInfo } from '../../data-loader/workspace-info';
import { VgAPI } from 'videogular2/core';
import { Synchronizer } from '../../util/sync';
import { zip } from '../../util/util';

  // #region [Constants]
  const FPS = 30
  const FRAME = 1 / FPS
  const JUMP = 10
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
  allFlashes: [number,number][]
  preload: string = 'auto';
  expanded: boolean = true;
  rates = ['0.25', '0.5', '1.0', '1.5', '2.0'];
  // #endregion

  // #region [Inputs]
  @Input() workspace: WorkspaceInfo;
  @Input() dataInfo: DataInfo;
  // #endregion

  // #region [Constructors]
  constructor(private el: ElementRef, private cdRef:ChangeDetectorRef) { }

  ngOnInit() {
    console.groupCollapsed('video component init');
    // select default video
    this.video = this.videos[0];
    this.sync = this.video.sync(this.dataInfo);
    this.videoElement = this.el.nativeElement.querySelector('vg-player > video');
    this.allFlashes = zip(this.dataInfo.flashes, this.video.flashes);
    console.info('video component init', this);
    console.groupEnd();
  }

  /** This prevents errors from changing the playback rate */
  ngAfterViewChecked() { this.cdRef.detectChanges() }
  // #endregion

  // #region [Accessors]
  get w() { return this.api.videogularElement.clientWidth }
  get h() { return this.api.videogularElement.clientHeight }
  get flashes() { return this.workspace._video[this.name].flashes }
  get videos() { return this.workspace.videos }
  get name() { return this.video.name }
  get src() { return 'video/' + this.video.path }
  get hasFlashes() { return this.video.flashes.length > 0 }
  // #endregion

  // #region [Public Methods]
  jumpTo(time: number) {
    if (!!time) this.api.seekTime(time) 
  }

  t(time: number | null, unit: 's' | 'ms') {
    if (time === null || time === undefined) return "N/A";
    else return time.toString() + ' ' + unit;
  }
  // #endregion

  // #region [Event Handlers]
  onPlayerReady(api: VgAPI) {
    this.api = api;
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

  // #region [Helper Methods]
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
}

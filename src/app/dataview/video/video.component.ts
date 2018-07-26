import { Component, OnInit, Input, ElementRef, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { WorkspaceInfo, DataInfo, VideoInfo } from '../../data-loader/workspace-info';
import { VgAPI } from 'videogular2/core';
import { Synchronizer } from '../../util/sync';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, AfterViewChecked {
  // #region [Properties]
  preload: string = 'auto';
  expanded: boolean = true;
  videoElement: HTMLVideoElement;
  api: VgAPI;
  video: VideoInfo;
  sync: Synchronizer;
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
    // video element
    this.videoElement = this.el.nativeElement.querySelector('vg-player > video');
    console.log('video element:', this.videoElement);
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
  jumpTo(time: number) { this.api.seekTime(time) }

  vt(time: number = this.api.time.current) { return time.toFixed(2) }
  dt(time: number = this.api.time.current) {
    if (this.sync.canSync) return Math.round(this.sync.vidToData(time))
    else return "N/A"
  }
  // #endregion

  // #region [Event Handlers]
  onPlayerReady(api: VgAPI) {
    this.api = api;
    console.log('video player ready', this.api);
  }
  // #endregion
}

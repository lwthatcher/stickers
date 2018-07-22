import { Component, OnInit, Input, ElementRef, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { WorkspaceInfo } from '../../data-loader/workspace-info';
import { VgAPI } from 'videogular2/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, AfterViewChecked {
  // #region [Properties]
  preload: string = 'auto';
  video: HTMLVideoElement;
  expanded: boolean;
  api: VgAPI;
  src: string;
  name: string;
  // #endregion

  // #region [Inputs]
  @Input() workspace: WorkspaceInfo;
  // #endregion

  // #region [Constructors]
  constructor(private el: ElementRef, private cdRef:ChangeDetectorRef) { }

  ngOnInit() {
    console.groupCollapsed('video component');
    this.expanded = true;
    // video source
    let vids = Object.keys(this.workspace.video);
    this.name = vids[0];
    this.src = this.source(this.name);
    console.log('source:', this.src);
    // video element
    this.video = this.el.nativeElement.querySelector('vg-player > video');
    console.log('video element:', this.video);
    console.info('video component init', this);
    console.groupEnd();
  }

  ngAfterViewChecked() { this.cdRef.detectChanges() }
  // #endregion

  // #region [Accessors]
  get w() { return this.api.videogularElement.clientWidth }
  get h() { return this.api.videogularElement.clientHeight }
  get flashes() { return this.workspace.video[this.name].flashes }
  // #endregion

  // #region [Public Methods]
  jumpTo(time: number) { this.api.seekTime(time) }
  // #endregion

  // #region [Event Handlers]
  onPlayerReady(api: VgAPI) {
    this.api = api;
    console.log('video player ready', this.api);
  }
  // #endregion

  // #region [Helper Methods]
  private source(videoName: string): string {
    let vidInfo = this.workspace.video[videoName];
    return 'static/' + vidInfo.path;
  }
  // #endregion
}

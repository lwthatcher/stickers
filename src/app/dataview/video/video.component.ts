import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { WorkspaceInfo } from '../../data-loader/workspace-info';
import { VgAPI } from 'videogular2/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  // #region [Properties]
  preload: string = 'auto';
  api: VgAPI;
  video: HTMLVideoElement;
  src: string;
  // #endregion

  // #region [Inputs]
  @Input() workspace: WorkspaceInfo;
  // #endregion

  // #region [Constructors]
  constructor(private el: ElementRef) { }

  ngOnInit() {
    console.groupCollapsed('video component');
    let vids = Object.keys(this.workspace.video);
    this.src = this.source(vids[0]);
    console.log('source:', this.src);
    this.video = this.el.nativeElement.querySelector('vg-player > video');
    console.log('video element:', this.video);
    console.info('video component init', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Event Handlers]
  onPlayerReady(api: VgAPI) {
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

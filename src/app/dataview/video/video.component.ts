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
  // #endregion

  // #region [Inputs]
  @Input() workspace: WorkspaceInfo;
  // #endregion

  // #region [Constructors]
  constructor(private el: ElementRef) { }

  ngOnInit() {
    console.groupCollapsed('video component');
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
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VideoInfo } from '../data-loader/workspace-info';

@Injectable()
export class SaverService {

  constructor(private http: HttpClient) { }

  saveFlashes(video: VideoInfo) {
    let request = {workspace: video.workspace, video: video.name, flashes: video.flashes}
    return this.http.post("/api/save/flashes", request);
  }

  saveLabels(stuff) {
    return this.http.post("/api/save/labels", stuff);
  }

  computeEnergy(stuff) {
    return this.http.post("/api/compute/energy", stuff);
  }
}

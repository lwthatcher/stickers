import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VideoInfo, TypeMap, LabelScheme } from '../data-loader/workspace-info';
import { Label } from '../dataview/labelstreams/labelstream';

// #region [Interfaces]
interface VideoInfoLike {
  workspace: string;
  name: string;
  flashes: number[];
}

interface SchemeLike {
  workspace: string;
  name: string;
  event_map: TypeMap; 
}
// #endregion

// #region [Service]
@Injectable()
export class SaverService {

  constructor(private http: HttpClient) { }

  saveFlashes(video: VideoInfo)
  saveFlashes(video: VideoInfoLike) {
    let request = {workspace: video.workspace, video: video.name, flashes: video.flashes}
    return this.http.post("/api/save/flashes", request);
  }

  saveLabels(scheme: SchemeLike, labels?: Label[])
  saveLabels(scheme: LabelScheme, labels?: Label[]) {
    labels = labels || [];
    let request = { workspace: scheme.workspace, 
                    scheme: scheme.name,
                    labels: labels,
                    'event-map': scheme.event_map }
    return this.http.post("/api/save/labels", request);
  }

  computeEnergy(stuff) {
    return this.http.post("/api/compute/energy", stuff);
  }
}
// #endregion

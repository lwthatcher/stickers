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

interface DataInfoLike {
  workspace: string;
  name: string;
}
// #endregion

@Injectable()
export class SaverService {
  // #region [Constructor]
  constructor(private http: HttpClient) { }
  // #endregion

  // #region [Public Methods]
  saveFlashes(video: VideoInfoLike)
  saveFlashes(video: VideoInfo) {
    let request = {workspace: video.workspace, video: video.name, flashes: video.flashes}
    return this.http.post("/api/save/flashes", request);
  }

  saveLabels(scheme: SchemeLike, labels?: Label[])
  saveLabels(scheme: LabelScheme, labels?: Label[]) {
    labels = labels || [];
    labels = this.clean(labels);
    let request = { workspace: scheme.workspace, 
                    scheme: scheme.name,
                    labels: labels,
                    'event-map': scheme.event_map }
    return this.http.post("/api/save/labels", request);
  }

  computeEnergy(stuff) {
    return this.http.post("/api/compute/energy", stuff);
  }
  // #endregion

  // #region [Helper Methods]
  private clean(labels: Label[]) {
    return labels.map((lbl) => {let {start,end,label} = lbl; return {start,end,label}; })
  }
  // #endregion
}

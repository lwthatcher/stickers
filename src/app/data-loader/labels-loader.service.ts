import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LabelScheme } from './workspace-info';
import { Synchronizer } from '../util/sync';

@Injectable()
export class LabelsLoaderService {

  // #region [Constructor]
  constructor(private http: HttpClient) { }
  // #endregion

  // #region [Public Methods]
  loadLabels(dataset: string, scheme: LabelScheme) {
    let flashes = scheme.sync(dataset);
    console.log('FLASHES', scheme.name, flashes, scheme.flashes);
    let sync = new Synchronizer(flashes);
    return this.http.get('/static/' + scheme.path).pipe(
      map((labels) => {return this.format(labels, scheme)}),
      map((labels) => {return this.syncTimes(labels, sync)})
    )
  }
  // #endregion

  // #region [Helper Methods]
  private format(lbls, scheme: LabelScheme) {
    return lbls.map((lbl) => {
      let label = scheme.lblKey(lbl.type);
      return {start: lbl.time, end: lbl.endTime, label: label, type:lbl.type }
    })
  }

  private syncTimes(lbls, sync: Synchronizer) {
    if (!sync.canSync) return lbls;
    console.log('sync', sync);
    return lbls.map((lbl) => {
      lbl.start = sync.vidToData(lbl.start);
      lbl.end = sync.vidToData(lbl.end);
      return lbl;
    })
  }
  // #endregion
}

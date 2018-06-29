import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LabelScheme } from './workspace-info';

@Injectable()
export class LabelsLoaderService {

  // #region [Constructor]
  constructor(private http: HttpClient) { }
  // #endregion

  // #region [Public Methods]
  loadLabels(dataset: string, scheme: LabelScheme) {
    return this.http.get('/static/' + scheme.path).pipe(
      map((labels) => {return this.format(labels, scheme)})
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
  // #endregion
}

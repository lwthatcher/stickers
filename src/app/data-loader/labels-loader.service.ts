import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LabelsLoaderService {

  constructor(private http: HttpClient) { }

  loadLabels(path: string, sync=[]) {
    return this.http.get('/static/'+path) as Observable<Object[]>;
  }

}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

// #region [Service]
@Injectable()
export class WorkspaceLoaderService {

  constructor(private http: HttpClient) { }

  listWorkspaces():  Observable<Object[]>{
    return this.http.get('/api/list-workspaces') as Observable<Object[]>;
  }

  listProjects(): Observable<Object[]>{
    return this.http.get('/api/list-projects') as Observable<Object[]>;
  }
}
// #endregion

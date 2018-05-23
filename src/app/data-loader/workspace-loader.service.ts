import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class WorkspaceLoaderService {

  constructor(private http: HttpClient) { }

  listWorkspaces() {
    console.debug('retrieving list of workspaces');
    return this.http.get('/api/list-workspaces');
  }

}

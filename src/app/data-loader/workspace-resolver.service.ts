import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkspaceInfo } from './workspace-info';
import { WorkspaceLoaderService } from './workspace-loader.service';

@Injectable()
export class WorkspaceResolver implements Resolve<WorkspaceInfo[]> {
  _workspaces: Observable<Object[]>;

  constructor(private loader: WorkspaceLoaderService) { }

  get workspaces() {
    if (!this._workspaces)
      this._workspaces = this.loader.listWorkspaces();
    return this._workspaces;
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WorkspaceInfo[]> {
    let ws = this.workspaces;
    let convert = (ws: Object[]) => { return ws.map((workspace) => {return new WorkspaceInfo(workspace)}) }
    return ws.pipe(map(convert));
  }
}

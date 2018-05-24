import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkspaceInfo } from './workspace-info';
import { WorkspaceLoaderService } from './workspace-loader.service';

@Injectable()
export class WorkspaceResolver implements Resolve<WorkspaceInfo[]> {
  _workspaces: Observable<WorkspaceInfo[]>;

  constructor(private loader: WorkspaceLoaderService) { }

  // #region [Accessors]
  get workspaces() {
    if (!this._workspaces) {
      let ws = this.loader.listWorkspaces();
      this._workspaces = ws.pipe(map(this.convert))
    }
    else { console.debug('loading memoized workspace list', this._workspaces); }
    return this._workspaces;
  }
  // #endregion

  // #region [Implementation]
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WorkspaceInfo[]> {
    console.debug('RESOLVING WORKSPACE(S)', route, state);
    if ('workspace' in route.params) {
      let finder = this.find(route.params.workspace);
      return this.workspaces.pipe(map(finder));
    }
    return this.workspaces;
  }
  // #endregion

  // #region [Helper Methods]
  private convert(ws: Object[]): WorkspaceInfo[] {
    return ws.map((workspace) => {return new WorkspaceInfo(workspace)})
  }

  private find(name) {
    let checkname = (workspace) => { return workspace.name === name; }
    return (ws: WorkspaceInfo[]) => {return ws.filter(checkname)}
  }
  // #endregion
}

import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkspaceInfo } from './info/workspace-info';
import { WorkspaceLoaderService } from './workspace-loader.service';

// #region [Interfaces]
type WorkspaceResponse = WorkspaceInfo | WorkspaceInfo[]
// #endregion

@Injectable()
export class WorkspaceResolver implements Resolve<WorkspaceResponse> {
  // #region [Constructor]
  _workspaces: Observable<WorkspaceInfo[]>;
  constructor(private loader: WorkspaceLoaderService) { }
  // #endregion

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
  // @ts-ignore
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WorkspaceResponse> {
    if ('workspace' in route.params) {
      let finder = this.find(route.params.workspace);
      // @ts-ignore
      return this.workspaces.pipe(map(finder)) as WorkspaceResponse;
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
    return (ws: WorkspaceInfo[]) => {return ws.filter(checkname)[0]}
  }
  // #endregion
}

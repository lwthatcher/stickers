import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkspaceInfo } from './info/workspace-info';
import { WorkspaceLoaderService } from './workspace-loader.service';

// #region [Interfaces]
interface ProjectMap { [name: string]: WorkspaceInfo[] }
interface ProjectResponse {
  workspaces: WorkspaceInfo[]
  projects: ProjectMap
}
type WorkspaceResponse = WorkspaceInfo | WorkspaceInfo[] | ProjectResponse
// #endregion

@Injectable()
export class WorkspaceResolver implements Resolve<WorkspaceResponse> {
  // #region [Constructor]
  _workspaces: Observable<WorkspaceInfo[]>;
  constructor(private loader: WorkspaceLoaderService) { }
  // #endregion

  // #region [Accessors]
  get workspaces() {
    if (!this._workspaces)
      this._workspaces = this.loader.listWorkspaces().pipe(map(this.convert))
    return this._workspaces;
  }
  // #endregion

  // #region [Implementation]
  // @ts-ignore
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WorkspaceResponse> {
    if ('workspace' in route.params) {
      // @ts-ignore
      return this.workspaces.pipe(map(this.find(route.params.workspace)));
    }
    return this.toResponse(this.workspaces);
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

  private toResponse(WS: Observable<WorkspaceInfo[]>) {
    return WS.pipe(map((workspaces) => {
      let projects = this.toProjects(workspaces)
      return {workspaces, projects}
    }))
  }

  private toProjects(workspaces: WorkspaceInfo[]): ProjectMap {
    let result = this.initProjMap(workspaces);
    for (let ws of workspaces) { result[ws.workspace[0]].push(ws) }
    return result
  }

  private initProjMap(workspaces: WorkspaceInfo[]) {
    let result = {}
    let projects = new Set(workspaces.map((ws) => ws.workspace[0]))
    for (let p of projects) { result[p] = [] }
    return result
  }

  // #endregion
}

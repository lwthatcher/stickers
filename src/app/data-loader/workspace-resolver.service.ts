import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkspaceInfo } from './workspace-info';
import { WorkspaceLoaderService } from './workspace-loader.service';

@Injectable()
export class WorkspaceResolver implements Resolve<WorkspaceInfo> {

  constructor(private loader: WorkspaceLoaderService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WorkspaceInfo> {
    let workspaces = this.loader.listWorkspaces()
    return workspaces.pipe(map((workspaces) => { return new Map(Object.entries(workspaces))} ))
  }

  

}

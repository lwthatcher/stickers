import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { WorkspaceInfo } from './workspace-info';
import { WorkspaceLoaderService } from './workspace-loader.service';

@Injectable()
export class WorkspaceResolver implements Resolve<WorkspaceInfo> {

  constructor(private loader: WorkspaceLoaderService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WorkspaceInfo> {
    return this.loader.listWorkspaces();
  }

  

}

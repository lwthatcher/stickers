import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataviewComponent } from './dataview/dataview.component';
import { HomeComponent } from './home/home.component';
import { WorkspaceResolver } from './data-loader/workspace-resolver.service';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, resolve: {workspaces: WorkspaceResolver} },
  { path: 'workspace/:workspace/:dataset', component: DataviewComponent, resolve: {workspace: WorkspaceResolver} }
]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
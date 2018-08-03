import { Component, OnInit, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceInfo } from '../data-loader/info/workspace-info';
import { WorkspaceComponent } from './workspace/workspace.component';

// #region [Interfaces]
interface ProjectMap { [name: string]: WorkspaceInfo[] }
// #endregion

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {
  // #region [Properties]
  workspaces: WorkspaceInfo[];
  projects: ProjectMap;
  @ViewChildren(WorkspaceComponent) children;
  // #endregion

  // #region [Constructors]
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.workspaces = this.route.snapshot.data.workspaces.workspaces;
    this.projects = this.route.snapshot.data.workspaces.projects;
    console.info('Home', this);
  }
  // #endregion

  // #region [Accessors]
  get project_names() { return Object.keys(this.projects) }

  get workspace_components() { return this.children.toArray() }
  // #endregion
}

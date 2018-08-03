import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceInfo } from '../data-loader/info/workspace-info';

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
  // #endregion

  // #region [Constructors]
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.workspaces = this.route.snapshot.data.workspaces.workspaces;
    this.projects = this.route.snapshot.data.workspaces.projects;
    console.info('workspaces', this.route.snapshot.data.workspaces);
  }
  // #endregion

  // #region [Accessors]
  get project_names() { return Object.keys(this.projects) }
  // #endregion
}

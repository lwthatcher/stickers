import { Component, OnInit, Input } from '@angular/core';
import { WorkspaceInfo, DataInfo, LabelScheme } from '../../data-loader/workspace-info';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {

  // #region [Variables]
  @Input() workspace: WorkspaceInfo;
  datasets: DataInfo[] = [];
  labelschemes: LabelScheme[] = [];
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    for (let ds of this.workspace.visibleData) {
      this.datasets.push(ds);
    }
    for (let ls of this.workspace.labelschemes) {
      this.labelschemes.push(ls)
    }
    this.labelschemes.push(this.workspace.EMPTY_SCHEME('None'))
  }
  // #endregion
}

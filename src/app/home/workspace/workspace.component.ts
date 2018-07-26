import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { WorkspaceInfo, DataInfo, LabelScheme } from '../../data-loader/workspace-info';
import { MatMenu } from '@angular/material/menu';

// #region [Interfaces]
interface SelectedInfo {
  dataset: DataInfo,
  labelscheme: LabelScheme
}
// #endregion

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  // #region [Inputs]
  @Input() workspace: WorkspaceInfo;
  @ViewChild('dsMenu') dsMenu: MatMenu;
  @ViewChild('lsMenu') lsMenu: MatMenu;
  // #endregion

  // #region [Variables]
  datasets: DataInfo[];
  labelschemes: LabelScheme[];
  selected: SelectedInfo = {dataset: undefined, labelscheme: undefined}
  classes: string;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    this.datasets = this.workspace.visibleData;
    this.labelschemes = this.workspace.labelschemes;
    this.labelschemes.push(this.workspace.EMPTY_SCHEME('None'))
    // default dataset/labelscheme
    this.selected.dataset = this.datasets[0];
    this.selected.labelscheme = this.labelschemes[0];
    // set dropdown classes
    this.classes = 'drop-down-selection w-100';
    this.dsMenu.classList = this.classes;
    console.log('workspace', this);
  }
  // #endregion

  // #region [Public Methods]
  selectData(dataset: DataInfo) { this.selected.dataset = dataset; }

  selectLabels(labelscheme: LabelScheme) { this.selected.labelscheme = labelscheme }
  // #endregion
}

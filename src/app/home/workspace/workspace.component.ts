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
    this.selected.dataset = this.defaultDataset();
    this.selected.labelscheme = this.defaultScheme();
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

  // #region [Accessors]
  get routerLink() {
    let result = []
    result.push("/workspace/" + this.workspace.name + "/" + this.selected.dataset.name);
    if (this.selected.labelscheme.name !== 'None')
      result.push({'labels': this.selected.labelscheme.name});
    return result;
  }

  get flashcount() { return this.selected.dataset.flashes.length }

  get typescount() { return Object.keys(this.selected.labelscheme.event_map).length }

  get flashBadge() { 
    return {'badge-danger': this.flashcount === 0,
            'badge-success': this.flashcount > 0} 
  }

  get formatBadge() {
    return {'badge-primary': this.selected.dataset.format === 'csv',
            'badge-secondary': this.selected.dataset.format !== 'csv'}
  }

  get hasLabelsBadge() {
    return {'badge-success': this.selected.labelscheme.hasLabels,
            'badge-danger': !this.selected.labelscheme.hasLabels}
  }

  get typesBadge() {
    return {'badge-primary': this.typescount > 0,
            'badge-secondary': this.typescount === 0}
  }
  // #endregion

  // #region [Helper Methods]

  private defaultDataset() {
    let datasets = this.datasets.filter((ds) => ds.flashes.length > 0);
    if (datasets.length === 0) return this.datasets[0];
    datasets = this.orderByType(datasets);
    return datasets[0];
  }

  private defaultScheme() {
    let schemes = this.labelschemes.filter((ls) => ls.hasLabels);
    if (schemes.length === 0) return this.labelschemes[0];
    schemes = this.orderByVideo(schemes);
    return schemes[0];
  }

  private orderByType(datasets) {
    let result = []
    result.push(...this.sortByChannels(datasets.filter((ds) => ds.format === 'csv')))
    result.push(...this.sortByChannels(datasets.filter((ds) => ds.format === 'tensor')))
    result.push(...this.sortByChannels(datasets.filter((ds) => ds.format === 'bdl')))
    return result
  }

  private sortByChannels(datasets) {
    let comparator = (a,b) => { return a.channels.length - b.channels.length }
    return datasets.sort(comparator)
  }

  private orderByVideo(schemes) {
    let result = []
    result.push(...schemes.filter((ls) => "video" in ls ))
    result.push(...schemes.filter((ls) => !("video" in ls) ))
    return result
  }
  // #endregion
}

import { Component, OnInit, Input } from '@angular/core';
import { WorkspaceInfo } from '../../data-loader/info/workspace-info';
import { LabelScheme } from "../../data-loader/info/label-scheme";
import { DataInfo } from "../../data-loader/info/data-info";

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
  // #endregion

  // #region [Variables]
  datasets: DataInfo[];
  labelschemes: LabelScheme[];
  selected: SelectedInfo = {dataset: undefined, labelscheme: undefined}
  canSync: boolean;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    this.datasets = this.workspace.visibleData;
    this.labelschemes = this.workspace.labelschemes;
    this.labelschemes.push(this.workspace.EMPTY_SCHEME('None'))
    this.selected.dataset = this.defaultDataset();
    this.selected.labelscheme = this.defaultScheme();
    this.canSync = this.checkCanSync();
    console.debug('workspace', this);
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

  get hasCSV() {
    return this.workspace.visibleData.some((d) => d.format === 'csv')
  }

  get hasLabels() {
    return this.workspace.labelschemes.some((d) => d.hasLabels)
  }
  // #endregion

  // #region [Helper Methods]
  private checkCanSync() {
    for (let v of this.workspace.videos) {
      for (let d of this.workspace.data) {
        if (v.sync(d).canSync) return true;
      }
    }
    return false;
  }

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
    let comparator = (a,b) => { return b.channels.length - a.channels.length }
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

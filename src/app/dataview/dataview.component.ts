import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { DataloaderService } from '../data-loader/data-loader.service';
import { WorkspaceInfo, DataInfo } from '../data-loader/workspace-info';


@Component({
  selector: 'app-dataview',
  templateUrl: 'dataview.component.html',
  styles: []
})
export class DataviewComponent implements OnInit {
  // #region [Constants]
  SENSOR_LENGTH_MAP = {
    'A': [0,1,2],
    'G': [3,4,5],
    'C': [6,7,8],
    'L': [9,10],
    'B': [11, 12]
  }
  // #endregion


  // #region [Properties]
  databarHeight = 200;
  downsample = true;
  dimensions = [[0,1,2], [3,4,5], [6,7,8], [9,10], [11, 12]];
  dataset: string;
  workspace: string;
  info: WorkspaceInfo;
  data_info: DataInfo;
  zoom_transform;
  // #endregion

  // #region [Accessors]
  get sensors() { 
    let result = []
    for (let s of this.data_info.channels) { result.push(s) }
    return result
  }
  // #endregion

  // #region [Constructors]
  constructor(private route: ActivatedRoute, private dataloader: DataloaderService) { }

  ngOnInit() {
    console.groupCollapsed('dataview init')
    // get parameters
    this.workspace = this.route.snapshot.paramMap.get('workspace');
    this.dataset = this.route.snapshot.paramMap.get('dataset');
    // get resolved data
    this.info = this.route.snapshot.data.workspace[0];
    this.data_info = this.info.getDataInfo(this.dataset);
    // specify which data to load
    this.dataloader.loadDataset(this.data_info);
    console.info('dataview initialized', this);
  }

  ngAfterViewInit() {
    console.debug('dataview children initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Event Handlers]
  onZoom(event) { this.zoom_transform = event.transform }

  @HostListener('document:keypress', ['$event'])
  keyPress(event) {
    if (event.key === 'i') this.logInfo();
  }
  // #endregion

  // #region [Helper Methods]
  private logInfo() {
    console.groupCollapsed('Workspace Info');
    console.log('name:', this.workspace);
    console.log('dataset name:', this.dataset);
    console.log('info:', this.info);
    console.log('data info:', this.data_info);
    console.log('component', this);
    console.groupEnd();
  }
  // #endregion
}

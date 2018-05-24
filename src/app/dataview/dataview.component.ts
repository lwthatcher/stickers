import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataloaderService } from '../data-loader/data-loader.service';
import { WorkspaceInfo, DataInfo } from '../data-loader/workspace-info';

@Component({
  selector: 'app-dataview',
  template: `
    <app-databar *ngFor="let dims of dimensions" [_height]="databarHeight" [dataset]="dataset" [dims]="dims"></app-databar>
  `,
  styles: []
})
export class DataviewComponent implements OnInit {
  databarHeight = 200;
  dimensions = [[0,1,2], [3,4,5], [6,7,8], [9,10], [11, 12]];
  dataset: string;
  format: string;
  workspace: string;
  info: WorkspaceInfo;
  data_info: DataInfo;

  constructor(private route: ActivatedRoute, private dataloader: DataloaderService) { }

  ngOnInit() {
    console.groupCollapsed('dataview init')
    // get parameters
    this.workspace = this.route.snapshot.paramMap.get('workspace');
    this.dataset = this.route.snapshot.paramMap.get('dataset');
    this.format = this.route.snapshot.paramMap.get('format') || 'csv';
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

}

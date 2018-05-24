import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataloaderService } from '../data-loader/data-loader.service';

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

  constructor(
    private route: ActivatedRoute, 
    private location: Location, 
    private dataloader: DataloaderService) { }

  ngOnInit() {
    console.groupCollapsed('dataview init')
    this.workspace = this.route.snapshot.paramMap.get('workspace');
    this.dataset = this.route.snapshot.paramMap.get('dataset');
    this.format = this.route.snapshot.paramMap.get('format') || 'csv';
    this.route.data.subscribe((data) => {console.log('dataview route data:', this.workspace, this.dataset, this.format, data)})
    this.dataloader.setDataset(this.dataset, this.format);
    console.info('dataview initialized', this);
  }

  ngAfterViewInit() {
    console.debug('dataview children initialized', this);
    console.groupEnd();
  }

}

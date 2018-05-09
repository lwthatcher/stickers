import { Component, OnInit } from '@angular/core';
import { DataloaderService } from '../dataloader.service';

@Component({
  selector: 'app-dataview',
  template: `
    <app-databar *ngFor="let dims of dimensions" [_height]="databarHeight" [dataset]="dataset" [dims]="dims"></app-databar>
  `,
  styles: []
})
export class DataviewComponent implements OnInit {
  databarHeight = 400;
  dataset = 'pills-blue';
  dimensions = [[0,1,2], [3,4,5], [6,7,8], [9,10,11]];

  constructor(private dataloader: DataloaderService) { }

  ngOnInit() {
    this.dataloader.setDataset(this.dataset);
    console.info('dataview init', this);
  }

}

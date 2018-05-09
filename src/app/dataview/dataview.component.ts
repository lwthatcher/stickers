import { Component, OnInit } from '@angular/core';
import { DataloaderService } from '../dataloader.service';

@Component({
  selector: 'app-dataview',
  template: `
  <app-databar [_height]="databarHeight" [dataset]="dataset"></app-databar>
  `,
  styles: []
})
export class DataviewComponent implements OnInit {
  databarHeight = 400;
  dataset = 'pills-blue';

  constructor(private dataloader: DataloaderService) { }

  ngOnInit() {
    this.dataloader.setDataset(this.dataset);
    console.info('dataview init', this);
  }

}

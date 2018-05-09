import { Component, OnInit } from '@angular/core';
import { DataloaderService } from '../dataloader.service';

@Component({
  selector: 'app-dataview',
  template: `
  <app-databar [_height]="databarHeight"></app-databar>
  `,
  styles: []
})
export class DataviewComponent implements OnInit {
  databarHeight = 400;

  constructor(private dataloader: DataloaderService) { }

  ngOnInit() {
    console.info('dataview init', this);
  }

}

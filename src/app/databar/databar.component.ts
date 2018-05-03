import { Component, OnInit } from '@angular/core';
import { DataloaderService } from '../dataloader.service';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";
import * as d3 from "d3";

@Component({
  selector: 'app-databar',
  template: `
    <svg width="100%" height="600" class="databar" (click)="clicked($event)"></svg>
  `,
  styleUrls: ['./databar.component.css']
})
export class DatabarComponent implements OnInit {
  width = 960;
  height = 400;
  radius = 10;
  data;

  constructor(private dataloader: DataloaderService) { }

  ngOnInit() {
    this.initData();
    console.log('init databar', this);
  }

  clicked(event: any) {
    console.log('clicked!', event)
    d3.select(event.target)
      .append('circle')
      .attr('cx', event.offsetX)
      .attr('cy', event.offsetY)
      .attr('r', this.radius)
      .attr('fill', 'red');
    console.log('data:', this.data);
  }

  initData(): void {
    this.dataloader.getData()
        .subscribe(b => {console.log('B-Data', parse(b))});
  }

  bufferToArrayBuffer(b) {
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
  }

}

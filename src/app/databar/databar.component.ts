import { Component, OnInit } from '@angular/core';
import { DataloaderService } from '../dataloader.service';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";
import * as d3 from "d3";

@Component({
  selector: 'app-databar',
  template: `
    <svg width="960" height="600" class="databar" (click)="clicked($event)">
      <g class="transform">
        <g class="signals"></g>
      </g>
    </svg>
  `,
  styleUrls: ['./databar.component.css']
})
export class DatabarComponent implements OnInit {
  margin = {top: 20, right: 20, bottom: 30, left: 50}
  radius = 10;
  width: number;
  height: number;
  svg; g; g_sigs;
  x; y; line;

  _data: Array<tf.Tensor>;

  constructor(private dataloader: DataloaderService) { }

  ngOnInit() {
    // load data
    let DATA = this.initData();
    // selectors
    this.svg = d3.select("svg");
    this.g = d3.select("svg > g.transform")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.g_sigs = d3.select("g > g.signals");
    // width/height
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
    console.log('widht/height', this.width, this.height);
    // line drawing funcs
    this.x = d3.scaleLinear().rangeRound([0, this.width]);
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);
    this.line = d3.line()
                  .x((d,i) => {return this.x(i)})
                  .y((d,i) => {return this.y(d)})
    // when data loads:
    DATA.then((axes_data) => axes_data.map((axis) => axis.dataSync()) )
        .then((axes) => this.set_domains(axes))
        .then((axes) => {
          for (let j = 0; j < axes.length; j++) {
            this.plot_axis(axes[j], j);
          }
    });
    console.log('init databar', this);
  }

  clicked(event: any) {
    console.log('clicked!', event)
  }

  plot_axis(data, j) {
    console.log('plotting axis:', j);
          // draw line(s)
          this.g_sigs.append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", "steelblue")
              .attr("stroke-width", 1.5)
              .attr("d", this.line);
  }

  set_domains(axes) {
    this.x.domain([0, axes[0].length]);
    this.y.domain([d3.min(axes, (ax) => d3.min(ax)), d3.max(axes, (ax) => d3.max(ax))]);
    console.log('x domain', this.x.domain(), this.x.range());
    console.log('y domain', this.y.domain(), this.y.range());
    return axes;
  }

  initData() {
    return this.dataloader.getData([0,1,2])
        .then(t => this._data = t)
        .then(() => { console.log('loaded data', this._data) })
        .then(() => { return this._data; })
  }
}

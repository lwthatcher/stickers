import { Component, OnInit, ElementRef } from '@angular/core';
import { DataloaderService } from '../dataloader.service';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";
import * as d3 from "d3";
import { TypedArray } from '@tensorflow/tfjs-core/dist/kernels/webgl/tex_util';

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
  // element selectors
  svg; g; g_sigs;
  // line drawing functions
  x; y; line;
  // color map
  colors;
  // data references
  _tensors: Array<tf.Tensor>;
  _data: Promise<(Float32Array | Int32Array | Uint8Array)[]>;

  constructor(private el: ElementRef, private dataloader: DataloaderService) { }

  ngOnInit() {
    // load data
    this._data = this.loadData();
    // selectors
    this.svg = d3.select("svg");
    this.g = d3.select("svg > g.transform")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.g_sigs = d3.select("g > g.signals");
    // width/height
    const WIDTH = this.el.nativeElement.offsetWidth;
    console.log('element width/height:', WIDTH, this.svg.attr("height"));
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
    console.log('width/height', this.width, this.height);
    // color map
    this.colors = d3.scaleOrdinal(d3.schemeAccent);
    // draw data (when it loads)
    this.draw(this._data);
    // log when finished
    console.log('init databar', this);
  }

  draw(data) {
    // set the x/y scales
    this.x = d3.scaleLinear().rangeRound([0, this.width]);
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);
    this.line = d3.line()
                  .x((d,i) => this.x(i))
                  .y((d,i) => this.y(d));
    // plot data when ready
    data.then((axes) => this.set_domains(axes))
        .then((axes) => {
          for (let j = 0; j < axes.length; j++) {
            this.plot_axis(axes[j], j);
          }
    });
  }

  plot_axis(data, j) {
    console.log('plotting axis:', j, this.colors(j));
          // draw line(s)
          this.g_sigs.append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("class", "line line-" + j.toString())
              .attr("stroke", this.colors(j))
              .attr("stroke-width", 1.5)
              .attr("stroke-opacity", 0.7)
              .attr("d", this.line);
  }

  set_domains(axes) {
    this.x.domain([0, axes[0].length]);
    this.y.domain([d3.min(axes, (ax) => d3.min(ax)), d3.max(axes, (ax) => d3.max(ax))]);
    console.log('x domain', this.x.domain(), this.x.range());
    console.log('y domain', this.y.domain(), this.y.range());
    return axes;
  }

  loadData(): Promise<(Float32Array | Int32Array | Uint8Array)[]> {
    return this.dataloader.getData([0,1,2])
        .then(t => this._tensors = t)
        .then(() => { console.log('loaded tensors', this._tensors); return this._tensors })
        .then((axes_data) => { return axes_data.map((axis) => axis.dataSync()) })
  }


  clicked(event: any) {
    console.log('clicked!', event);
    console.log('svg', this.el.nativeElement, this.el);
    console.log('svg', this.el.nativeElement.offsetWidth, this.el.nativeElement.offsetHeight);
  }
}

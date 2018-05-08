import { Component, OnInit, ElementRef } from '@angular/core';
import { DataloaderService } from '../dataloader.service';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";
import * as d3 from "d3";
import { TypedArray } from '@tensorflow/tfjs-core/dist/kernels/webgl/tex_util';

@Component({
  selector: 'app-databar',
  template: `
    <svg width="100%" height="600" class="databar" (click)="clicked($event)">
      <g class="transform">
        <g class="signals"></g>
        <g class="axes"></g>
      </g>
    </svg>
  `,
  styleUrls: ['./databar.component.css']
})
export class DatabarComponent implements OnInit {
  // #region [Variables]
  margin = {top: 20, right: 20, bottom: 30, left: 50}
  radius = 10;
  // element selectors
  svg; g; g_sigs; g_axes;
  // line drawing functions
  x; y; line;
  // color map
  colors;
  // data references
  _tensors: Array<tf.Tensor>;
  _data: Promise<(Float32Array | Int32Array | Uint8Array)[]>;
  // #endregion

  // #region [Accessors]
  get WIDTH() { return this.el.nativeElement.offsetWidth; }

  get HEIGHT() { return +this.svg.attr("height"); }

  get width() { return this.el.nativeElement.offsetWidth - this.margin.left - this.margin.right; }

  get height() { return +this.svg.attr("height") - this.margin.top - this.margin.bottom; }
  // #endregion

  // #region [Constructors]
  constructor(private el: ElementRef, private dataloader: DataloaderService) { }

  ngOnInit() {
    // load data
    this._data = this.loadData();
    // selectors
    this.svg = d3.select("svg");
    this.g = d3.select("svg > g.transform")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.g_sigs = d3.select("g.transform > g.signals");
    this.g_axes = d3.select("g.transform > g.axes");
    // color map
    this.colors = d3.scaleOrdinal(d3.schemeAccent);
    // draw data (when it loads)
    this.draw();
    // redraw if window resized
    window.addEventListener('resize', (e) => {
      console.debug('window resize', this.width, this.height, e);
      this.clear();
      this.draw();
    })
    // log when finished
    console.info('init databar', this);
  }
  // #endregion

  // #region [Plotting]
  draw() {
    // retrieve data promise
    const data = this._data;
    // set the x/y scales
    this.x = d3.scaleLinear().rangeRound([0, this.width]);
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);
    this.line = d3.line()
                  .x((d,i) => this.x(i))
                  .y((d,i) => this.y(d));
    // plot data when ready
    data.then((axes) => this.set_domains(axes))
        .then((axes) => this.draw_xAxis(axes))
        .then((axes) => this.draw_yAxis(axes))
        .then((axes) => {
          for (let j = 0; j < axes.length; j++) {
            this.plot_dim(axes[j], j);
          }
    });
  }

  clear() {
    this.g_sigs.selectAll("*").remove();
  }

  draw_xAxis(data) {
    this.g_axes.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(d3.axisBottom(this.x));
    return data;
  }

  draw_yAxis(data) {
    this.g_axes.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(this.y));
    return data;
  }

  plot_dim(data, j) {
    console.debug('plotting axis:', j, this.colors(j));
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
    console.debug('x domain', this.x.domain(), this.x.range());
    console.debug('y domain', this.y.domain(), this.y.range());
    return axes;
  }
  // #endregion

  // #region [Data Loading]
  loadData(): Promise<(Float32Array | Int32Array | Uint8Array)[]> {
    return this.dataloader.getData([0,1,2])
        .then(t => this._tensors = t)
        .then(() => { console.log('loaded tensors', this._tensors); return this._tensors })
        .then((axes_data) => { return axes_data.map((axis) => axis.dataSync()) })
  }
  // #endregion

  // region [Event Handlers]
  clicked(event: any) {
    console.debug('clicked!', event);
    console.debug('svg', this.el.nativeElement, this.el);
  }
  // #endregion
}

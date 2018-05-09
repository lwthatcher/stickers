import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { DataloaderService } from '../dataloader.service';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";
import * as d3 from "d3";

@Component({
  selector: 'app-databar',
  template: `
    <svg width="100%" class="databar" (click)="clicked($event)">
      <g class="transform">
        <defs>
          <clipPath id="clip">
            <rect class='clip-rect'></rect>
          </clipPath>
        </defs>
        <g class="signals"></g>
        <g class="axes"></g>
        <rect class="zoom"></rect>
      </g>
    </svg>
  `,
  styleUrls: ['./databar.component.css']
})
export class DatabarComponent implements OnInit {
  // #region [Inputs]
  @Input() _height: number;
  @Input() dataset: string;
  // #endregion

  // #region [Variables]
  margin = {top: 20, right: 20, bottom: 30, left: 50}
  radius = 10;
  // element selectors
  host;
  svg; g; g_sigs; g_axes; 
  r_zoom; r_clip;
  // line drawing functions
  x; y; line; x0;
  // color map
  colors;
  // zoom handler
  zoom;
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
    let host = d3.select(this.el.nativeElement);
    this.host = host;
    console.log('HOST', this.host, this.el);
    this.svg = host.select("svg")
                   .attr('height', this._height);
    this.g = host.select("svg > g.transform")
                 .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.g_sigs = host.select("g.transform > g.signals");
    this.g_axes = host.select("g.transform > g.axes");
    this.r_zoom = host.select("g.transform > rect.zoom")
                      .attr('width', this.width)
                      .attr('height', this.height);
    this.r_clip = host.select('#clip > rect.clip-rect')
                      .attr('width', this.width)
                      .attr('height', this.height);
    // color map
    this.colors = d3.scaleOrdinal(d3.schemeAccent);
    // setup zoom behaviour
    this.zoom = d3.zoom()
                  .scaleExtent([1, 50])
                  .translateExtent([[0, 0], [this.width, this.height]])
                  .extent([[0, 0], [this.width, this.height]])
                  .on('zoom', () => this.zoomed());
    this.r_zoom.call(this.zoom);
    // draw data (when it loads)
    this.draw();
    // redraw if window resized
    window.addEventListener('resize', (e) => {
      console.debug('window resize', this.width, this.height, e);
      this.clear();
      this.draw();
    })
    // log when finished
    console.info('databar init', this);
  }
  // #endregion

  // #region [Plotting Methods]
  draw() {
    // retrieve data promise
    const data = this._data;
    // set the x/y scales
    this.x = d3.scaleLinear().rangeRound([0, this.width]);
    this.x0 = d3.scaleLinear().rangeRound([0, this.width]);
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
    this.g_axes.selectAll("*").remove();
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
              .attr("clip-path", "url(#clip)")
              .attr("class", "line line-" + j.toString())
              .attr("stroke", this.colors(j))
              .attr("stroke-width", 1.5)
              .attr("stroke-opacity", 0.7)
              .attr("d", this.line);
  }

  set_domains(axes) {
    this.x.domain([0, axes[0].length]);
    this.x0.domain(this.x.domain());
    this.y.domain([d3.min(axes, (ax) => d3.min(ax)), d3.max(axes, (ax) => d3.max(ax))]);
    console.debug('x domain', this.x.domain(), this.x.range());
    console.debug('x0 domain', this.x0.domain(), this.x0.range());
    console.debug('y domain', this.y.domain(), this.y.range());
    return axes;
  }
  // #endregion

  // #region [Data Loading]
  loadData(): Promise<(Float32Array | Int32Array | Uint8Array)[]> {
    return this.dataloader.getData(this.dataset, [0,1,2])
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

  zoomed() {
    const t = d3.event.transform;
    // rescale x-domain to zoom level
    this.x.domain(t.rescaleX(this.x0).domain());
    // redraw signals
    this.host.selectAll('g.signals > path.line').attr("d", this.line);
    // redraw x-axis
    this.host.selectAll('g.axes > g.x-axis').remove();
    this.draw_xAxis(this._data);
  }
  // #endregion
}

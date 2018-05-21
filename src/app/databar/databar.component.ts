import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { DataloaderService, Dataset } from '../dataloader.service';
import { parse } from "tfjs-npy";
import { Spinner } from 'spin.js';
import { largestTriangleThreeBucket } from 'd3fc-sample';
import * as tf from "@tensorflow/tfjs-core";
import * as d3 from "d3";

interface datum {
  d: number;
  i: number;
}

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
  @Input() dims: Array<number>;
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
  _old_bucket_size;
  // data references
  _dataset: Dataset;
  _data: Promise<Array<datum>[]>;
  // loading spinner
  spinner: Spinner;
  // #endregion

  // #region [Accessors]
  get WIDTH() { return this.el.nativeElement.offsetWidth; }

  get HEIGHT() { return +this.svg.attr("height"); }

  get width() { return this.el.nativeElement.offsetWidth - this.margin.left - this.margin.right; }

  get height() { return +this.svg.attr("height") - this.margin.top - this.margin.bottom; }

  get points_per_pixel() { return (this.x.domain()[1] - this.x.domain()[0]) / (this.x.range()[1] - this.x.range()[0]) }

  get bucket_size() { return Math.trunc(this.points_per_pixel / 2) }
  // #endregion

  // #region [Constructors]
  constructor(private el: ElementRef, private dataloader: DataloaderService) { }

  ngOnInit() {
    // load data
    this._data = this.load_data();
    // selectors
    let host = d3.select(this.el.nativeElement);
    this.host = host;
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
    this.start_spinner();
    this.draw();
    this._old_bucket_size = this.bucket_size;
    // redraw if window resized
    window.addEventListener('resize', (e) => { this.resize(e) })
    // log when finished
    console.info('databar initialized', this);
  }
  // #endregion

  // #region [Plotting Methods]
  async draw() {
    // set the respective ranges for x/y
    this.set_ranges();
    // wait for data to load
    let data = await this._data;
    // stop loading-spinner once the domains are updated
    await this.set_domains(data);
    this.stop_spinner();
    // draw axes
    this.draw_xAxis();
    this.draw_yAxis();
    // draw each signal
    this.plot_signals(data);
  }

  clear() {
    this.g_sigs.selectAll("*").remove();
    this.g_axes.selectAll("*").remove();
  }

  private downsample(data) {
    const sampler = largestTriangleThreeBucket();
    sampler.x((d) => {return d.d})
            .y((d) => {return d.i})
    // adaptive bucket size
    sampler.bucketSize(this.bucket_size);
    // return sampled data
    const result = data.map((axis) => { return sampler(axis) });
    console.debug('downsampled:', data[0].length, result[0].length, this.bucket_size);
    return result;
  }

  private draw_xAxis() {
    this.g_axes.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(d3.axisBottom(this.x));
  }

  private draw_yAxis() {
    this.g_axes.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(this.y));
  }

  private plot_signals(_data) {
    // downsample first
    let data = this.downsample(_data);
    // draw each signal
    for (let j = 0; j < data.length; j++) {
      this.plot_signal(data[j], j);
    }
  }

  private plot_signal(signal, j) {
    this.g_sigs.append("path")
        .datum(signal)
        .attr("fill", "none")
        .attr("clip-path", "url(#clip)")
        .attr("class", "line line-" + j.toString())
        .attr("stroke", this.colors(j))
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.7)
        .attr("d", this.line);
  }

  private set_ranges() {
    // set x-ranges
    this.x = d3.scaleLinear().rangeRound([0, this.width]);
    this.x0 = d3.scaleLinear().rangeRound([0, this.width]);
    // set y-ranges
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);
    // update line method to new ranges
    this.line = d3.line().x((d,i) => this.x(d.i))
                         .y((d,i) => this.y(d.d));
  }

  private async set_domains(axes) {
    this.x.domain([0, axes[0].length]);
    this.x0.domain(this.x.domain());
    this.y.domain([d3.min(axes, (ax) => d3.min(ax, (d) => d.d)), 
                   d3.max(axes, (ax) => d3.max(ax, (d) => d.d))]);
    console.debug('domains/ranges', this.domains_and_ranges());
    return Promise.resolve();
  }
  // #endregion

  // #region [Data Loading]
  load_data(): Promise<Array<datum>[]> {
    return this.dataloader.getData(this.dataset, this.dims)
        .then((_dataset) => this._dataset = _dataset)
        .then(() => { console.debug('loaded dataset', this._dataset) })
        .then(() => { return this._dataset.format() })
        .then((axes) => {return axes.map((axis) => { return Array.from(axis).map((d,i) => { return {d, i} })}) })
  }

  private start_spinner(): void {
    const opts = {
      lines: 13, // The number of lines to draw
      length: 40, // The length of each line
      width: 20, // The line thickness
      radius: 45, // The radius of the inner circle
      scale: 1, // Scales overall size of the spinner
      corners: 1, // Corner roundness (0..1)
      color: '#636288', // CSS color or array of colors
      fadeColor: 'transparent', // CSS color or array of colors
      speed: 1, // Rounds per second
      rotate: 0, // The rotation offset
      animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
      direction: 1, // 1: clockwise, -1: counterclockwise
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      className: 'spinner', // The CSS class to assign to the spinner
      top: '51%', // Top position relative to parent
      left: '50%', // Left position relative to parent
      shadow: '0 0 1px transparent', // Box-shadow for the lines
      position: 'absolute' // Element positioning
    }
    let target = this.el.nativeElement;
    this.spinner = new Spinner(opts).spin(target);
  }

  private stop_spinner() {
    this.spinner.stop();
  }
  // #endregion

  // #region [Event Handlers]
  clicked(event: any) {
    console.debug('clicked!', event);
    console.debug('svg', this.el.nativeElement, this.el);
  }

  zoomed() {
    const t = d3.event.transform;
    // update bucket size
    const bucket_delta = this._old_bucket_size - this.bucket_size;
    console.debug('zoom',this.bucket_size, this._old_bucket_size, bucket_delta);
    this._old_bucket_size = this.bucket_size;
    // rescale x-domain to zoom level
    this.x.domain(t.rescaleX(this.x0).domain());
    // redraw signals
    this.host.selectAll('g.signals > path.line').attr("d", this.line);
    // redraw x-axis
    this.host.selectAll('g.axes > g.x-axis').remove();
    this.draw_xAxis();
  }

  resize(event: any) {
    console.debug('window resize', this.width, this.height);
    this.clear();
    this.draw();
  }
  // #endregion

  // #region [Helper Methods]
    private domains_and_ranges() {
      let dr = (d) => {return [d.domain(), d.range()]}
      return {x: dr(this.x), x0: dr(this.x0), y: dr(this.y)}
    }
  // #endregion
}

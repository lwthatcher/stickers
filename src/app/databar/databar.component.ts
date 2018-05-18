import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { DataloaderService, Dataset, SignalStream } from '../dataloader.service';
import { parse } from "tfjs-npy";
import { Spinner } from 'spin.js';
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
  // data references
  _dataset: Dataset;
  _data: Promise<SignalStream>;
  // loading spinner
  spinner: Spinner;
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
    this.startSpinner();
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
  async draw() {
    // set the x/y scales
    this.x = d3.scaleLinear().rangeRound([0, this.width]);
    this.x0 = d3.scaleLinear().rangeRound([0, this.width]);
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);
    this.line = d3.line()
                  .x((d,i) => this.x(i))
                  .y((d,i) => this.y(d));
    // wait for data to load
    const data = await this._data;
    this.stopSpinner(data);
    this.set_domains(data);
    // draw axes
    this.draw_xAxis(data);
    this.draw_yAxis(data);
    // draw each signal
    for (let j = 0; j < data.length; j++) {
      this.plot_dim(data[j], j);
    }
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
  loadData(): Promise<SignalStream> {
    return this.dataloader.getData(this.dataset, this.dims)
        .then((_dataset) => this._dataset = _dataset)
        .then(() => { console.info('loaded dataset', this._dataset) })
        .then(() => { return this._dataset.format() })
  }

  startSpinner(): void {
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

  stopSpinner(data) {
    this.spinner.stop();
    return data;
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

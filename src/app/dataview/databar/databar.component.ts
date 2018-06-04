// #region [Imports]
import { Component, 
         OnInit, 
         ElementRef, 
         Input, 
         EventEmitter, 
         Output, 
         OnChanges, 
         SimpleChange, 
         HostListener } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';
import { DataloaderService, Dataset } from '../../data-loader/data-loader.service';
import { DataInfo } from '../../data-loader/workspace-info';
import { Spinner } from 'spin.js';
import { largestTriangleThreeBucket } from 'd3fc-sample';
import { Sensor } from "../dataview.component";
import { Labeller, Label, LabelStream } from './labeller';
import * as d3 from "d3";
// #endregion

 // #region [Interfaces]
interface datum {
  d: number;
  i: number;
}

interface Selection {
  select(selector: string): Selection
  selectAll(selector: string): Selection
  attr(attribute: string): any
  attr(attribue: string, value: any): Selection
  classed(attribute: string): Selection
  classed(attribue: string, value: any): Selection
  style(attribute: string, value: any): Selection
  append(element: string): Selection
  data(data: any): Selection
  datum(data: any): Selection
  enter(): Selection
  on(event: string): any
  on(event: string, callback): Selection
  on(event: string, callback, capture: boolean): Selection
  text(value): Selection
  call(value: any): Selection
  filter(filter: any): Selection
  merge(selection: Selection): Selection
  remove()
}

interface ColorMap {
  (i:number): any
}
// #endregion

// #region [Metadata]
@Component({
  selector: 'app-databar',
  templateUrl: './databar.component.html',
  styleUrls: ['./databar.component.css']
})
// #endregion
export class DatabarComponent implements OnInit, OnChanges {
  // #region [Inputs]
  @Input() _height: number;
  @Input() enable_downsampling: boolean;
  @Input() data_info: DataInfo;
  @Input() transform;
  @Input() sensor: Sensor;
  @Input() labelstream: LabelStream;
  // #endregion

  // #region [Outputs]
  @Output() zoom = new EventEmitter<any>();
  @Output() labelsChange = new EventEmitter<Label[]>();
  // #endregion

  // #region [Variables]
  margin = {top: 5, right: 20, bottom: 20, left: 50}
  initialized = false;
  // element selectors
  host: Selection;
  svg: Selection; 
  g: Selection; 
  g_sigs: Selection; 
  g_axes: Selection;
  g_lbls: Selection; 
  g_hand: Selection;
  r_zoom: Selection;
  r_clip: Selection;
  container: Element;
  // line drawing functions
  x; y; line; x0;
  // color maps
  line_color: ColorMap;
  label_color: ColorMap;
  // zoom handler
  _zoom;
  // data references
  _dataset: Dataset;
  _data: Promise<Array<datum>[]>;
  // loading spinner
  spinner: Spinner;
  // helpers
  labeller: Labeller;
  // #endregion

  // #region [Accessors]
  get WIDTH() { return this.container.clientWidth; }

  get HEIGHT() { return this._height; }

  get width() { return this.WIDTH - this.margin.left - this.margin.right; }

  get height() { return this.HEIGHT - this.margin.top - this.margin.bottom; }

  get points_per_pixel() { return (this.x.domain()[1] - this.x.domain()[0]) / (this.x.range()[1] - this.x.range()[0]) }

  get bucket_size() { return Math.trunc(this.points_per_pixel / 2) }

  get selected_label() { return this.labels && this.labels.find((lbl) => lbl.selected) || false }

  get labels() { return this.labelstream && this.labelstream.labels || [] }
  // #endregion

  // #region [Constructors]
  constructor(private el: ElementRef, 
              private dataloader: DataloaderService,
              private settings: SettingsService) { }

  ngOnInit() {
    console.groupCollapsed('databar init', this.sensor.name);
    // load data
    this._data = this.load_data();
    // selectors
    this.container = document.querySelector('div.card');
    console.log('container', this.container);
    console.debug('width/height', this.width, this.height);
    let host = d3.select(this.el.nativeElement);
    this.host = host;
    this.svg = host.select("div > svg")
                   .attr('height', this._height);
    this.g = host.select("svg > g.transform")
                 .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.g_sigs = host.select("g.transform > g.signals");
    this.g_axes = host.select("g.transform > g.axes");
    this.g_lbls = host.select("g.transform > g.labels");
    this.g_hand = host.select("g.transform > g.handles");
    this.r_zoom = host.select("g.transform > rect.zoom")
                      .attr('width', this.width)
                      .attr('height', this.height);
    this.r_clip = host.select('#clip > rect.clip-rect')
                      .attr('width', this.width)
                      .attr('height', this.height);
    // color maps
    this.line_color = d3.scaleOrdinal(d3.schemeAccent);
    this.label_color = d3.scaleOrdinal(d3.schemePaired);
    // setup helpers
    this.labeller = new Labeller(this);
    // setup zoom behaviour
    this._zoom = d3.zoom()
                  .scaleExtent([1, 50])
                  .translateExtent([[0, 0], [this.width, this.height]])
                  .extent([[0, 0], [this.width, this.height]])
                  .on('zoom', () => this.zoomed());
    this.r_zoom.call(this._zoom);
    // draw data (when it loads)
    this.start_spinner();
    this.draw();
    // log when finished
    this.initialized = true;
    console.info('databar initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Lifecycle Hooks]
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    let {transform, labels} = changes;
    if (transform && !transform.firstChange) this.updateZoom(transform.currentValue);
    if (labels && this.initialized) this.draw_labels();
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
    // draw labels
    if (this.labels) 
      this.draw_labels();
    // draw handles if label selected
    if (this.selected_label)
      this.draw_handles();
  }

  draw_labels() {
    // updated elements
    let rects = this.g_lbls.selectAll('rect.label')
                    .data(this.labels)
                    .classed('updated', true);
    // entering (new) elements
    let enter = rects.enter()
                     .append('rect')
                     .attr('y', 0)
                     .attr('height', this.height)
                     .attr("clip-path", "url(#clip)")
                     .classed('label', true)
                     .on('click', (d) => { this.lbl_clicked(d) }, false)
                     .call(d3.drag().on('drag', (...d) => { this.lbl_dragged(d) }))
    enter.append('svg:title')
         .text((d) => {return d.type + ' event' || 'event ' + d.label.toString()})
    // both updated or new elements
    rects = enter.merge(rects)
          .attr('x', (d) => { return this.x(d.start)})
          .attr('width', (d) =>{ return this.x(d.end) - this.x(d.start) })
          .attr('fill', (d) => { return this.label_color(d.label) })
          .classed('selected', (d) => d.selected )
  }

  clear(...layers) {
    // if no parameters given, clear everything
    if (layers.length === 0) {
      this.g_sigs.selectAll("*").remove();
      this.g_axes.selectAll("*").remove();
      this.g_lbls.selectAll("*").remove();
      this.g_hand.selectAll("*").remove();
      return;
    }
    // otherwise clear specified layers
    if (layers.includes('signals')) this.g_sigs.selectAll("*").remove();
    if (layers.includes('axes')) this.g_axes.selectAll("*").remove();
    if (layers.includes('labels')) this.g_lbls.selectAll("*").remove();
    if (layers.includes('handles')) this.g_hand.selectAll("*").remove();
    if (layers.includes('x-axis')) this.g_axes.selectAll("g.x-axis").remove();
    if (layers.includes('y-axis')) this.g_axes.selectAll("g.y-axis").remove();
  }

  draw_handles(lbl?: Label) {
    // if no label is selected, clear the handles and return
    if (!lbl) { lbl = this.selected_label as Label }
    if (!lbl) { this.clear('handles'); return; }
    // selections
    let left = this.g_hand.selectAll('rect.drag-handle.left').data([lbl]);
    let right = this.g_hand.selectAll('rect.drag-handle.right').data([lbl]);
    // draw left/right handles
    left = this._add_handle(left, 'left');
    right = this._add_handle(right, 'right');
    // conditionally format if width == 0
    if (lbl.start === lbl.end) {
      left.classed('warn', true);
      right.classed('warn', true);
    }
    else {
      left.classed('warn', false);
      right.classed('warn', false);
    }
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

  private async plot_signals(_data) {
    // downsample first
    _data = await Promise.resolve(_data);
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
        .attr("stroke", this.line_color(j))
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.7)
        .attr("d", this.line);
  }

  private _add_handle(selection: Selection, side: 'left' | 'right') {
    let callback;
    if (side === 'left') callback = (d) => { return this.x(d.start) - 5 }
    else callback = (d) => { return this.x(d.end) - 5 }
    return selection.enter().append('rect')
                    .attr('width', 10)
                    .classed('drag-handle', true)
                    .classed(side, true)
                    .attr('y', 0)
                    .attr('height', this.height)
                    .call(d3.drag().on('drag', (d) => { this.lbl_resize(d, side) }))
                    .merge(selection)
                    .attr('x', callback)
  }
  // #endregion

  // #region [Domains and Ranges]
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
    return Promise.resolve();
  }
  // #endregion

  // #region [Event Handlers]
  clicked(event: any) {
    // ignore clicks on labels
    if (d3.select(event.target).classed('label')) { return }
    // otherwise deselect any selected labels
    this.labeller.deselect();
  }

  zoomed() { this.zoom.emit(d3.event) }

  lbl_resize(d, side) { this.labeller.resize(d, side) }

  lbl_clicked(d) { this.labeller.select(d) }

  lbl_dragged(_d) {
    let [d,i,arr] = _d;
    if (!d.selected) { return }                   // only drag if selected
    this.labeller.move(d, d3.select(arr[i]))       // otherwise move label
  }

  @HostListener('window:resize', ['$event'])
  window_resize(event: any) {
    console.debug('window resize', this.width, this.height);
    this.clear();
    this.draw();
    this.r_clip.attr('width', this.width);
  }

  @HostListener('document:keypress', ['$event'])
  keyPress(event) {
    if (event.key === 'i') this.logInfo();
    else if (event.key === 'Delete' && this.selected_label) this.labeller.delete(this.selected_label);
    else console.debug('unbound key-press:', event, d3.mouse());
  }

  private updateZoom(t) {
    // rescale x-domain to zoom level
    this.x.domain(t.rescaleX(this.x0).domain());
    // redraw signals
    this.host.selectAll('g.signals > path.line').attr("d", this.line);
    // redraw x-axis
    this.clear('x-axis');
    this.draw_xAxis();
    // redraw labels
    this.draw_labels();
    this.draw_handles();
  }
  // #endregion

  // #region [Data Loading]
  load_data(): Promise<Array<datum>[]> {
    let toArray = (axis) => { return Array.from(axis).map((d,i) => { return {d, i} }) as Array<datum> }
    return this.dataloader.getSensorStreams(this.data_info.name, this.sensor.idxs)
        .then((_dataset) => this._dataset = _dataset)
        .then(() => { console.debug('loaded dataset', this._dataset) })
        .then(() => { return this._dataset.format() })
        .then((axes) => {return axes.map(toArray)})
  }

  private start_spinner(): void {
    const opts = this.settings.spinner_options;
    let target = this.el.nativeElement;
    this.spinner = new Spinner(opts).spin(target);
  }

  private stop_spinner() {
    this.spinner.stop();
  }

  private downsample(data) {
    // only downsample if enabled
    if (!this.enable_downsampling) return data;
    // setup sampler
    const sampler = largestTriangleThreeBucket();
    sampler.x((d) => {return d.d})
           .y((d) => {return d.i})
    // adaptive bucket size
    sampler.bucketSize(this.bucket_size);
    // return sampled data
    const result = data.map((axis) => { return sampler(axis) });
    console.debug('resampled size:', result[0].length)
    return result;
  }
  // #endregion

  // #region [Helper Methods]
  private logInfo() {
    console.groupCollapsed('Databar ' + this.sensor.name);
    console.log('heights/widths:', [this.height, this.width], [this.HEIGHT, this.WIDTH]);
    console.log('label-stream:', this.labelstream);
    console.log('labels:', this.labels);
    console.log('sensor:', this.sensor);
    console.log('current zoom:', this.transform);
    console.log('Dataset:', this._dataset);
    console.log('data info:', this.data_info);
    console.log('domains/ranges:', this.domains_and_ranges());
    console.log('databar component', this);
    console.groupEnd()
  }

  private domains_and_ranges() {
    let dr = (d) => {return [d.domain(), d.range()]}
    return {x: dr(this.x), x0: dr(this.x0), y: dr(this.y)}
  }
  // #endregion
}

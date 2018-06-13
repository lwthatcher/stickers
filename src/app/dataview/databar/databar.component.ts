// #region [Imports]
import { Component, 
         ElementRef, 
         Input, 
         Output,
         HostListener,
         EventEmitter,
         SimpleChange,
         OnInit, 
         OnChanges,
         OnDestroy } from '@angular/core';
import { SettingsService, DownsamplingMethod } from '../../settings/settings.service';
import { DataloaderService, Dataset } from '../../data-loader/data-loader.service';
import { DataInfo } from '../../data-loader/workspace-info';
import { Spinner } from 'spin.js';
import { largestTriangleThreeBucket } from 'd3fc-sample';
import { Sensor } from "../sensor";
import { Colorer} from '../colorer';
import { Labeller, Label, LabelStream } from './labeller';
import { Drawer } from './drawer';
import { ToolMode } from './tool-mode.enum';
import * as d3 from "d3";
// #endregion

 // #region [Interfaces]
interface datum {
  d: number;
  i: number;
}
// #endregion

// #region [Metadata]
@Component({
  selector: 'app-databar',
  templateUrl: './databar.component.html',
  styleUrls: ['./databar.component.css']
})
// #endregion
export class DatabarComponent implements OnInit, OnChanges, OnDestroy {
  // #region [Inputs]
  @Input() data_info: DataInfo;
  @Input() transform;
  @Input() sensor: Sensor;
  @Input() labelstream: LabelStream;
  @Input() mode: ToolMode;
  @Input() lbl_type;
  @Input() colorer: Colorer;
  // #endregion

  // #region [Outputs]
  @Output() zoom = new EventEmitter<any>();
  // #endregion

  // #region [Variables]
  margin = {top: 5, right: 20, bottom: 20, left: 50}
  container: Element;
  // line drawing functions
  x; y; line; x0;
  // zoom handler
  _zoom;
  // data references
  _dataset: Dataset;
  _data: Promise<Array<datum>[]>;
  // loading spinner
  spinner: Spinner;
  // helpers
  labeller: Labeller;
  drawer: Drawer;
  // initialization flags
  initialized = false;
  registration;
  // settings variables
  _height: number;
  downsampling: DownsamplingMethod;
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

  get is_registered() { return !!this.registration }

  get element() { return this.el }
  // #endregion

  // #region [Constructors]
  constructor(private el: ElementRef, 
              private dataloader: DataloaderService,
              private settings: SettingsService) {
    this._height = this.settings.databar_height;
    this.downsampling = this.settings.downsampling;
  }

  ngOnInit() {
    console.groupCollapsed('databar init', this.sensor.name);
    // load data
    this._data = this.load_data();
    // selectors
    this.container = document.querySelector('div.card');
    console.log('container', this.container);
    // setup helpers
    this.labeller = new Labeller(this);
    this.drawer = new Drawer(this);
    console.debug('width/height', this.width, this.height);
    // setup zoom behaviour
    this._zoom = d3.zoom()
                  .scaleExtent([1, 50])
                  .translateExtent([[0, 0], [this.width, this.height]])
                  .extent([[0, 0], [this.width, this.height]])
                  .on('zoom', () => this.zoomed());
    this.drawer.layers['svg'].call(this._zoom);
    // draw data (when it loads)
    this.start_spinner();
    this.drawer.draw();
    // mode and label-stream initialization
    this.updateMode(this.mode);
    this.register_lblstream();
    this.register_sensor();
    // log when finished
    this.initialized = true;
    console.info('databar initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Lifecycle Hooks]
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    let {transform, labelstream, mode, lbl_type} = changes;
    if (transform && !transform.firstChange) this.updateZoom(transform.currentValue);
    if (labelstream && !labelstream.firstChange) this.stream_changed(labelstream);
    if (mode && !mode.firstChange) this.mode_changed(mode);
    if (lbl_type && !lbl_type.firstChange) this.type_changed(lbl_type);
  }

  ngOnDestroy() {
    if (this.registration) this.registration.unsubscribe();
  }
  // #endregion

  // #region [Domains and Ranges]
  set_ranges() {
    // set x-ranges
    this.x = d3.scaleLinear().rangeRound([0, this.width]);
    this.x0 = d3.scaleLinear().rangeRound([0, this.width]);
    // set y-ranges
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);
    // update line method to new ranges
    this.line = d3.line().x((d,i) => this.x(d.i))
                         .y((d,i) => this.y(d.d));
  }

  set_domains(axes) {
    this.x.domain([0, axes[0].length]);
    this.x0.domain(this.x.domain());
    this.y.domain([d3.min(axes, (ax) => d3.min(ax, (d) => d.d)), 
                   d3.max(axes, (ax) => d3.max(ax, (d) => d.d))]);
  }
  // #endregion

  // #region [Event Handlers]
  clicked(event: any) {
    // ignore clicks on labels
    if (d3.select(event.target).classed('label')) { return }
    // otherwise deselect any selected labels
    this.labeller.deselect();
    if (this.mode === ToolMode.Click) {
      let px = event.x - this.margin.left;
      let type = parseInt(this.lbl_type);
      this.labeller.add(px, type);
    }
  }

  zoomed() {
    let bg = this.drawer.layers['zoom'];
    let [x,y] = d3.mouse(bg.node());
    let w = bg.attr('width');
    let h = bg.attr('height');
    let in_rect = (x > 0 && x < w && y > 0);
    if (in_rect) this.zoom.emit(d3.event);
  }

  lbl_resize(d, side) { this.labeller.resize(d, side) }

  lbl_clicked(d) { this.labeller.select(d) }

  lbl_dragged(_d) {
    if (this.mode !== ToolMode.Selection) return;   // can only drag in edit mode
    let [d,i,arr] = _d;               
    this.labeller.move(d, d3.select(arr[i]))       // otherwise move label
  }

  stream_update(event) {
    console.debug('label stream update:', event);
    this.drawer.draw_labels();
    this.drawer.draw_handles();
  }

  stream_changed(change) {
    this.register_lblstream();
    console.debug('lbl stream changed', this.is_registered, this.labelstream);
    if (!this.is_registered) console.warn('label stream not registered!', this);
    // redraw labels/drag-handles
    this.drawer.draw_labels();
    this.drawer.draw_handles();
  }

  mode_changed(change) { this.updateMode(this.mode) }

  type_changed(change) {
    // TODO: we want to find some other functionality than this...
    if (this.selected_label) 
        this.labeller.change_label(this.selected_label, this.lbl_type);
  }

  sensor_update(event) {
    console.debug('sensor update detected:', event, this.sensor);
    if (event === 'redraw') {
      this._data = this.load_data();
      this.drawer.clear();
      this.drawer.draw();
    }
    else if (event === 'toggle-labels') {
      this.drawer.draw_labels();
      this.drawer.draw_handles();
    }
  }

  @HostListener('window:resize', ['$event'])
  window_resize(event: any) {
    console.debug('window resize', this.width, this.height);
    this.drawer.clear();
    this.drawer.draw();
    this.drawer.layers['clip'].attr('width', this.width);
  }

  @HostListener('document:keypress', ['$event'])
  keyPress(event) {
    if (event.key === 'i') this.logInfo();
    else if (event.key === 'Delete' && this.selected_label) this.labeller.delete(this.selected_label);
    else console.debug('unbound key-press:', this.sensor.name, event);
  }
  // #endregion

  // #region [Update Methods]
  private updateMode(mode) {
    let background = this.drawer.layers['zoom'];
    if (mode === ToolMode.Selection) {
      console.debug('selection mode', mode);
      background.classed('selection-mode', true);
      background.classed('click-mode', false);
    }
    else if (mode === ToolMode.Click) {
      console.debug('click mode', mode);
      background.classed('selection-mode', false);
      background.classed('click-mode', true);
    }
  }

  private updateZoom(t) {
    // rescale x-domain to zoom level
    this.x.domain(t.rescaleX(this.x0).domain());
    // redraw signals
    this.drawer.signals.attr("d", this.line);
    // redraw x-axis
    this.drawer.clear('x-axis');
    this.drawer.draw_xAxis();
    // redraw labels
    this.drawer.draw_labels();
    this.drawer.draw_handles();
  }

  private register_lblstream() {
    if (!this.labelstream) return false;
    if (this.registration) this.registration.unsubscribe();
    this.registration = this.labelstream.event.subscribe((e) => { this.stream_update(e) })
    return true;
  }

  private register_sensor() {
    this.sensor.event.subscribe((e) => { this.sensor_update(e) })
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

  start_spinner(): void {
    const opts = this.settings.spinner_options;
    let target = this.el.nativeElement;
    this.spinner = new Spinner(opts).spin(target);
  }

  stop_spinner() {
    this.spinner.stop();
  }

  downsample(data) {
    // only downsample if enabled
    if (this.downsampling === 'off') return data;
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
    console.groupCollapsed('svg / drawing');
      console.log('heights/widths:', [this.height, this.width], [this.HEIGHT, this.WIDTH]);
      console.log('current zoom:', this.transform);
      console.log('domains/ranges:', this.domains_and_ranges());
    console.groupEnd();
    console.groupCollapsed('labels');
      console.log('label-stream:', this.labelstream);
      console.log('registered stream:', this.registration, this.is_registered);
      console.log('labels:', this.labels);
    console.groupEnd();
    console.groupCollapsed('dataset');
      console.log('Dataset:', this._dataset);
      console.log('data info:', this.data_info);
      console.log('sensor:', this.sensor);
    console.groupEnd();
    console.log('databar component', this);
    console.groupEnd()
  }

  private domains_and_ranges() {
    let dr = (d) => {return [d.domain(), d.range()]}
    return {x: dr(this.x), x0: dr(this.x0), y: dr(this.y)}
  }
  // #endregion
}

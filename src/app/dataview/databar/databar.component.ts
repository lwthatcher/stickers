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
import { Labeller } from './labeller';
import { Label, LabelStream } from '../labelstream';
import { Drawer } from './drawer';
import { ToolMode, ModeTracker } from '../modes/tool-mode';
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
  @Input() mode: ModeTracker;
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
    console.debug('container', this.container);
    // setup helpers
    this.labeller = new Labeller(this);
    this.drawer = new Drawer(this);
    // draw data (when it loads)
    this.start_spinner();
    this.drawer.draw();
    // mode and label-stream initialization
    this.updateMode(this.mode);
    this.register_lblstream();
    this.register_sensor();
    this.register_mode();
    // log when finished
    this.initialized = true;
    console.debug('width/height', this.width, this.height);
    console.info('databar initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Lifecycle Hooks]
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    let {transform, labelstream, lbl_type} = changes;
    if (transform && !transform.firstChange) this.updateZoom(transform.currentValue);
    if (labelstream && !labelstream.firstChange) this.stream_changed(labelstream);
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
  stream_update(event) {
    if (event === 'change-type') { this.type_changed(event) }
    else { this.redraw_labels() }
  }

  stream_changed(change) {
    this.register_lblstream();
    console.debug('lbl stream changed', this.is_registered, this.labelstream);
    if (!this.is_registered)
        console.warn('label stream not registered!', this);
    this.redraw_labels();
  }

  mode_changed(change) { this.updateMode(this.mode) }

  type_changed(change) {
    console.debug('type change:', change)
    // todo: if selected-label -> change-type
  }

  sensor_update(event) {
    console.debug('sensor update detected:', event, this.sensor);
    if (event === 'redraw') {
      this._data = this.load_data();
      this.drawer.clear();
      this.drawer.draw();
    }
    else if (event === 'toggle-labels') { this.redraw_labels() }
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
  private updateMode(mode?: ModeTracker) {
    mode = mode || this.mode;
    let background = this.drawer.layers['zoom'];
    background.classed('selection-mode', mode.selection);
    background.classed('click-mode', mode.click);
    console.debug('mode update:', mode.current);
    if (mode.click) { this.labeller.deselect() }
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

  private register_mode() {
    this.mode.event.subscribe((mode) => { this.mode_changed(mode) })
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

  private redraw_labels() {
    this.drawer.draw_labels();
    this.drawer.draw_handles();
  }
  // #endregion
}

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
import { Dataset } from '../../data-loader/dataset';
import { DataInfo } from "../../data-loader/info/data-info";
import { Spinner } from 'spin.js';
import { largestTriangleThreeBucket } from 'd3fc-sample';
import { Sensor } from "../sensors/sensor";
import { Colorer} from '../event-types/colorer';
import { Labeller } from './labeller/labeller';
import { LabelStream } from '../labelstreams/labelstream';
import { Drawer } from './drawer/drawer';
import { ModeTracker } from '../modes/tool-mode';
import { EnergyWellsTracker } from '../energy/energy-wells';
import { VideoTracker } from '../video/video-tracker';
import { EnergyGradientTracker } from '../energy/energy-gradient';
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
  @Input() dataset: Promise<Dataset>;
  @Input() energy: EnergyWellsTracker;
  @Input() gradient: EnergyGradientTracker;
  @Input() video: VideoTracker;
  // #endregion

  // #region [Outputs]
  @Output() zoom = new EventEmitter<any>();
  // #endregion

  // #region [Variables]
  margin = {top: 4, right: 50, bottom: 20, left: 50}
  container: Element;
  // zoom handler
  _zoom;
  // data references
  _data: Promise<datum[][]>;
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
  get x() { return this.drawer.x }

  get x0() { return this.drawer.x0 }

  get WIDTH() { return this.container.clientWidth; }

  get HEIGHT() { return this._height; }

  get width() { return this.WIDTH - this.margin.left - this.margin.right; }

  get height() { return this.HEIGHT - this.margin.top - this.margin.bottom; }

  get points_per_pixel() { return ((this.x.domain()[1] - this.x.domain()[0])/this.data_info.rate) / (this.x.range()[1] - this.x.range()[0]) }

  get bucket_size() { return Math.trunc(this.points_per_pixel / 2) }

  get selected_label() { return this.labels && this.labels.find((lbl) => lbl.selected) || false }

  get labels() { return this.labelstream && this.labelstream.labels || [] }

  get is_registered() { return !!this.registration }

  get element() { return this.el }

  get has_energy() { return this.energy.has_energy }
  // #endregion

  // #region [Constructors]
  constructor(private el: ElementRef, 
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
    // initialize mode and register observers
    this.updateMode(this.mode);
    this.register_lblstream();
    this.register_sensor();
    this.register_mode();
    this.register_energy();
    // log when finished
    this.initialized = true;
    console.debug('width/height', this.width, this.height);
    console.info('databar initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Lifecycle Hooks]
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    let {transform, labelstream, lbl_type, video} = changes;
    if (transform && !transform.firstChange) this.updateZoom(transform.currentValue);
    if (labelstream && !labelstream.firstChange) this.stream_changed(labelstream);
    if (lbl_type && !lbl_type.firstChange) this.type_changed(lbl_type);
    if (video && !video.firstChange) this.video_changed(video);
  }

  ngOnDestroy() {
    if (this.registration) this.registration.unsubscribe();
  }
  // #endregion

  // #region [Event Handlers]
  video_changed(change) {
    if (!!change.currentValue) {
      console.log('video tracker ready:', change, this.video);
      this.register_video();
    }
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
    console.debug('type change:', change, this.labelstream.eventType);
  }

  stream_update(event) {
    if (event.type === 'change-type') { this.type_changed(event) }
    else if (event.type === 'grow') { this.drawer.updateLabel(event.target) }
    else { this.redraw_labels() }
  }

  energy_update(event) {
    if (event.type === 'display-mode') { 
      this.drawer.clear('energy', 'y-axis');
      this.drawer.draw_yAxis();
    }
    this.drawer.draw_energy();
  }

  gradient_update(event) {
    console.log('gradient update!', event)
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
    if (event.key === 'Delete' && this.selected_label) this.labeller.delete(this.selected_label);
  }
  // #endregion

  // #region [Update Methods]
  private updateMode(mode?: ModeTracker) {
    mode = mode || this.mode;
    let background = this.drawer.layers['zoom'];
    background.classed('selection-mode', mode.selection);
    background.classed('click-mode', mode.click);
    background.classed('pour-mode', mode.pour);
    console.debug('mode update:', mode.current);
    if (mode.click || mode.pour) { this.labeller.deselect() }
  }

  private updateZoom(t) {
    // rescale x-domain to zoom level
    this.drawer.x.domain(t.rescaleX(this.x0).domain());
    this.drawer.xe.domain(t.rescaleX(this.x0).domain());
    // redraw signals
    this.drawer.updateSignals();
    this.drawer.updateEnergy();
    // redraw x-axis
    this.drawer.clear('x-axis');
    this.drawer.draw_xAxis();
    // redraw labels
    this.drawer.updateLabels();
    this.drawer.draw_handles();
    // redraw current-time-bar
    this.drawer.draw_ctb();
  }
  // #endregion

  // #region [Registrations]
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

  private register_energy() {
    this.energy.event.subscribe((e) => { this.energy_update(e) })
    this.gradient.event.subscribe((e) => { this.gradient_update(e) })
  }

  private register_video() {
    if (this.video.defined) {
      if (this.video.sync.canSync)
        this.video.subscriptions.timeUpdate.subscribe(() => { this.drawer.draw_ctb() })
      else {
        this.video.syncChange.subscribe((t) => {
          this.video.subscriptions.timeUpdate.subscribe(() => { this.drawer.draw_ctb() })
          this.drawer.draw_ctb();
        })
      }
    }
  }
  // #endregion

  // #region [Data Loading]
  load_data(): Promise<datum[][]> {
    return this.dataset.then((ds) => { return ds.get(this.sensor) })
  }

  start_spinner(): void {
    const opts = this.settings.spinner_options;
    let target = this.el.nativeElement;
    this.spinner = new Spinner(opts).spin(target);
  }

  stop_spinner() { this.spinner.stop() }

  downsample(data) {
    // only downsample if enabled
    if (this.downsampling === 'off') return data;
    if (this.data_info.format === 'bdl') return data;
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
    console.groupCollapsed('helpers');
      this.labeller.logInfo();
      this.drawer.logInfo();
    console.groupEnd();
    console.groupCollapsed('svg / drawing');
      console.log('heights/widths:', [this.height, this.width], [this.HEIGHT, this.WIDTH]);
      console.log('current zoom:', this.transform);
      // console.log('domains/ranges:', this.domains_and_ranges());
    console.groupEnd();
    console.groupCollapsed('labels');
      console.log('label-stream:', this.labelstream);
      console.log('registered stream:', this.registration, this.is_registered);
      console.log('labels:', this.labels);
    console.groupEnd();
    console.groupCollapsed('dataset');
      console.log('Dataset:', this.dataset);
      console.log('data info:', this.data_info);
      console.log('sensor:', this.sensor);
    console.groupEnd();
    console.log('databar component', this);
    console.groupEnd()
  }

  private redraw_labels() {
    this.drawer.draw_labels();
    this.drawer.draw_handles();
  }
  // #endregion
}

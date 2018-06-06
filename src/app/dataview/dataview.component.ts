// #region [Imports]
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { DataloaderService } from '../data-loader/data-loader.service';
import { WorkspaceInfo, DataInfo } from '../data-loader/workspace-info';
import { Label, LabelStream, EventMap } from './databar/labeller';
import { ToolMode } from './databar/tool-mode.enum';
import { ColorerService, ColorMap } from './colorer.service';
// #endregion

// #region [Interfaces]
export interface Sensor {
  id: number;
  name: string;
  idxs: number[];
  dims: string[];
  hide: boolean;
  labelstream: string;
}

type ArrayLike = Float32Array | Int32Array | Uint8Array | number[] | any[]

type LabelStreamMap = { [key: string]: LabelStream }
// #endregion

// #region [Metadata]
@Component({
  selector: 'app-dataview',
  templateUrl: 'dataview.component.html',
  styleUrls: ['dataview.component.css'],
  providers: [DataloaderService, ColorerService]
})
// #endregion
export class DataviewComponent implements OnInit {
  // #region [Constants]
  SENSOR_DIMS = {
    'A': ['x', 'y', 'z'],
    'G': ['x', 'y', 'z'],
    'C': ['x', 'y', 'z'],
    'L': ['both', 'infrared'],
    'B': ['altitude', 'temperature']
  }

  SENSOR_NAMES = {
    'A': 'Accelerometer',
    'G': 'Gyroscope',
    'C': 'Compass',
    'L': 'Light',
    'B': 'Barometer'
  }

  TOOL_MODE = ToolMode;
  // #endregion

  // #region [Accessors]
  get visibleSensors() { return this.sensors.filter((s) => !s.hide) }

  get is_labelled(): boolean { return !!this.data_info.labelled }

  get eventMap(): EventMap {
    if (!this.is_labelled) return {}
    const ds = this.data_info.labelled as string;
    return this.info.labels[ds]['event-map'];
  }

  get default_stream(): string {
    if (!this.is_labelled) return "user-labels";
    return this.data_info.labelled as string;
  }

  get streams(): string[] {
    return Object.keys(this.labelStreams)
  }

  get sensor_names() {
    let channels = this.data_info.channels;
    return [...channels].map((c) => { return this.SENSOR_NAMES[c] })
  }

  get event_types(): string[] {
    return Object.keys(this.eventMap)
  }
  // #endregion

  // #region [Properties]
  databarHeight = 200;
  downsample = true;
  dataset: string;
  workspace: string;
  info: WorkspaceInfo;
  data_info: DataInfo;
  sensors: Sensor[];
  zoom_transform;
  labels: Label[];
  labelStreams: LabelStreamMap = {};
  mode: ToolMode = ToolMode.Selection;
  lbl = "1";
  label_color: ColorMap;
  print_ls: string;
  // #endregion

  // #region [Constructors]
  constructor(private route: ActivatedRoute, 
              private dataloader: DataloaderService,
              private colorer: ColorerService) {
                this.label_color = this.colorer.label_color;
              }

  ngOnInit() {
    console.groupCollapsed('dataview init')
    // get parameters
    this.workspace = this.route.snapshot.paramMap.get('workspace');
    this.dataset = this.route.snapshot.paramMap.get('dataset');
    // get resolved data
    this.info = this.route.snapshot.data.workspace[0];
    this.data_info = this.info.getDataInfo(this.dataset);
    // create list of Sensor objects
    this.sensors = this.setupSensors(this.data_info.channels);
    // specify which data to load
    this.dataloader.loadDataset(this.data_info);
    // parse labels (when ready)
    if (this.is_labelled) {
      let _labels = this.dataloader.getLabels(this.dataset);
      this.parse_labels(_labels)
          .then((labels) => { this.addStream(this.default_stream, labels) })
    }
    this.addStream('user-labels', []);
    // component initialized
    console.info('dataview initialized', this);
  }

  ngAfterViewInit() {
    console.debug('dataview children initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Label Types]
  style_color(label: number) {
    let c = this.label_color(label);
    return {"background-color": c};
  }

  is_active(label: number | string) {
    return this.lbl == label;
  }
  // #endregion

  // #region [Label Streams]
  addStream(name: string, labels: Label[] = []) {
    this.labelStreams[name] = new LabelStream(name, labels, this.eventMap);
  }

  showLabels(sensor: Sensor) {
    return this.labelStreams[sensor.labelstream] && this.labelStreams[sensor.labelstream].show;
  }
  // #endregion

  // #region [Event Handlers]
  onZoom(event) { this.zoom_transform = event.transform }

  hide(sensor: Sensor) { this.sensors[sensor.id].hide = true }

  show(sensor: Sensor) { this.sensors[sensor.id].hide = false }

  selectStream(sensor, stream) { sensor.labelstream = stream }

  changeSensor(sensor, to) { console.log('changing sensor type:', sensor, to) }

  toggleLabels(stream) { this.labelStreams[stream].toggle() }

  newStream() { console.log('lets make another stream!') }

  change_ls(stream) {console.log('changing print label-stream', stream); this.print_ls = stream;}

  save_labels() {
    console.info('saving label-stream', this.print_ls, this.labelStreams[this.print_ls].sort())
  }

  @HostListener('document:keypress', ['$event'])
  keyPress(event) {
    if (event.key === 'i') this.logInfo();
  }
  // #endregion

  // #region [Data Loading]
  parse_labels(labels: Promise<ArrayLike>): Promise<Label[]> {
    return labels.then((lbls) => {return this.boundaries(lbls)})
                 .then((boundaries) => { return boundaries.filter((lbl) => lbl.label !== 0) })
  }
  // #endregion

  // #region [Helper Methods]
  private logInfo() {
    console.groupCollapsed('Dataview');
    console.log('name:', this.workspace);
    console.groupCollapsed('workspace info');
      console.log('dataset name:', this.dataset);
      console.log('data info:', this.data_info);
      console.log('workspace info:', this.info);
    console.groupEnd();
    console.groupCollapsed('sensors');
      console.log('sensors:', this.sensors);
      console.log('sensor names:', this.sensor_names);
    console.groupEnd();
    console.groupCollapsed('label streams');
      console.log('label streams:', this.labelStreams);
      console.log('num observers:', this.getObservers());
      console.log('event-map:', this.eventMap);
      console.log('default label stream:', this.default_stream);
    console.groupEnd();
    console.log('dataview component', this);
    console.groupEnd();
  }

  /**
   * Returns a list of observing databars for each label-stream
   */
  private getObservers() {
    let result = {}
    for (let entry of Object.entries(this.labelStreams)) {
      let [key, value] = entry;
      result[key] = value.event.observers;
    }
    return result;
  }

  /**
   * Infers discrete event start/end times from a stream of label readings
   * 
   * @param lbls the stream of label IDs
   */
  private boundaries(lbls: ArrayLike): Label[] {
    // helper functions
    let boundaryChange = (v,i,arr) => { return arr[i-1] && v[1] != arr[i-1][1] }
    let convert = (v,j,arr) => {
      let [i1,l1] = v;
      let [i2,l2] = arr[j+1] || lbls[lbls.length-1];
      let result = {start:i1, end:i2, label:l1} as Label;
      if (l1 in this.eventMap) result.type = this.eventMap[l1];
      return result;
    }
    // format from ArrayLike -> array of tuples: [index, label]
    lbls = Array.from(lbls);            // make sure its an Array (not TypedArray)
    lbls = Array.from(lbls.entries());  // look at both the value and index
    // find boundaries (points where the values changed)
    let boundaries = lbls.filter(boundaryChange)
    boundaries.unshift(lbls[0])         // add the first point
    // converts to list of Label objects
    let result = boundaries.map(convert)
    return result;
  }

  /**
   * Takes the channel string and returns an ordered list of Sensor objects,
   * including their corresponding dimensions and indices 
   * to be passed to the data-bar components.
   * 
   * @param channels a string where each character specifies a sensor channel
   */
  private setupSensors(channels: string): Sensor[] {
    // takes the channel and creates the name and dims aspects of the object
    let toSensor = (channel: string, i: number) => {
      const name = this.SENSOR_NAMES[channel];
      const dims = this.SENSOR_DIMS[channel];
      return {name, channel, dims, hide:false, id:i, labelstream: this.default_stream}
    }
    let len = (sensor) => sensor.dims.length  // map -> # of sensors
    let sum = (acc, cur) => acc + cur         // reduce -> sum over array
    // takes the (mostly) complete Sensor ojbect from toSensor and adds the idxs field
    let getIdxs = (sensor,i,arr) => {
      let so_far = arr.slice(0,i).map(len).reduce(sum, 0)
      let idx = sensor.dims.map((_,i) => so_far+i);
      sensor.idxs = idx;
      return sensor as Sensor;
    }
    return [...channels].map(toSensor).map(getIdxs)
  }
  // #endregion
}
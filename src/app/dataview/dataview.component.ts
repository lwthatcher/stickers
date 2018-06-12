// #region [Imports]
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { saveAs } from 'file-saver/FileSaver';
import { DataloaderService } from '../data-loader/data-loader.service';
import { WorkspaceInfo, DataInfo } from '../data-loader/workspace-info';
import { SettingsService } from '../settings/settings.service'
import { Label, LabelStream, EventMap } from './databar/labeller';
import { ToolMode } from './databar/tool-mode.enum';
import { Colorer } from './colorer';
import { Sensor } from './sensor';
// #endregion

// #region [Interfaces]
// export interface Sensor {
//   id: number;
//   name: string;
//   idxs: number[];
//   dims: string[];
//   hide: boolean;
//   labelstream: string;
//   channel?: string;
// }
interface SensorInfo {
  name: string;
  index: number;
}

type ArrayLike = Float32Array | Int32Array | Uint8Array | number[] | any[]

type LabelStreamMap = { [key: string]: LabelStream }

type IdxEntries = [number, number[]][]
type IndexMap = Map<number,number[]>

type LabelKey = number | string
// #endregion

// #region [Metadata]
@Component({
  selector: 'app-dataview',
  templateUrl: 'dataview.component.html',
  styleUrls: ['dataview.component.css'],
  providers: [DataloaderService]
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

  get known_sensors(): SensorInfo[] {
    let channels = this.data_info.channels;
    return [...channels].map((c,i) => { return {name: this.SENSOR_NAMES[c], index: i} })
  }

  get event_types(): string[] {
    return Object.keys(this.eventMap)
  }

  get idx_map(): IndexMap {
    if (!this._idx_map) 
      this._idx_map = this.gen_idx_map(this.data_info.channels);
    return this._idx_map;
  }

  get settings() {
    return this._settings;
  }

  get colors() {
    if (this._colors === undefined) 
      this._colors = this.colorer.labels.entries.map((entry) => entry.key)
    return this._colors;
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
  labelStreams: LabelStreamMap = {};
  mode: ToolMode = ToolMode.Selection;
  lbl: LabelKey;
  colorer: Colorer;
  print_ls: string;
  private _idx_map: Map<number,number[]>;
  private _colors = undefined;
  // #endregion

  // #region [Constructors]
  constructor(private route: ActivatedRoute, 
              private dataloader: DataloaderService,
              private _settings: SettingsService) { }

  ngOnInit() {
    console.groupCollapsed('dataview init')
    // get parameters
    this.workspace = this.route.snapshot.paramMap.get('workspace');
    this.dataset = this.route.snapshot.paramMap.get('dataset');
    // get resolved data
    this.info = this.route.snapshot.data.workspace[0];
    this.data_info = this.info.getDataInfo(this.dataset);
    // setup helper class(es)
    this.colorer = new Colorer(this);
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
    // initial selected label-type
    this.lbl = this.event_types[0];
    // add user-labels stream, setup default save-lbls stream
    this.addStream('user-labels', []);
    this.print_ls = this.default_stream;
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
    let c = this.colorer.labels.get(label);
    return {"background-color": c};
  }

  is_active(label: LabelKey) {
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

  // #region [Sensors]
  getSensor(id) {
    return this.sensors.find((s) => s.id === id);
  }

  private update_sensor(sensor: Sensor, to: SensorInfo) {
    let channel = this.data_info.channels[to.index];
    sensor.name = to.name;
    sensor.dims = this.SENSOR_DIMS[to.index];
    sensor.idxs = this.idx_map.get(to.index);
  }

  private remove_sensor(sensor: Sensor) {
    console.log('remove-sensor stub:', sensor);
  }
  // #endregion

  // #region [Event Handlers]
  onZoom(event) { this.zoom_transform = event.transform }

  hide(sensor: Sensor) { this.sensors[sensor.id].hide = true }

  show(sensor: Sensor) { this.sensors[sensor.id].hide = false }

  selectStream(sensor, stream) { sensor.labelstream = stream }

  changeSensor(sensor: Sensor, to: SensorInfo) { 
    // change sensor information
    this.update_sensor(sensor, to);
    console.log('changed sensor:', sensor);
  }

  toggleLabels(stream) { this.labelStreams[stream].toggle() }

  // TODO: implement
  newStream() { console.log('lets make another stream!') }

  change_ls(stream) {console.debug('changing print label-stream:', stream); this.print_ls = stream;}

  save_labels() {
    let json = this.labelStreams[this.print_ls].toJSON();
    let name = this.print_ls + '.labels.json'
    console.info('saving label-stream:', this.print_ls, name, json);
    let blob = new Blob([json], {type: 'application/json;charset=utf-8'})
    saveAs(blob, name);
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
      console.log('sensor names:', this.known_sensors);
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
   * Creates the idx-map Map object.
   * Should only be run once.
   */
  private gen_idx_map(channels: string): IndexMap {
    // some helper closures
    let len = (c) => this.SENSOR_DIMS[c].length  // map -> # of sensors for given channel
    let sum = (acc, cur) => acc + cur           // reduce -> sum over array
    let getIdxs = (c,i,arr) => { 
      let so_far = arr.slice(0,i).map(len).reduce(sum, 0)
      let idx = this.SENSOR_DIMS[c].map((_,i) => so_far+i);
      return [i, idx]
    }
    // apply map to get entries
    let entries = [...channels].map(getIdxs) as IdxEntries
    // convert entries to Map
    return new Map<number,number[]>(entries);
  }

  /**
   * Takes the channel string and returns an ordered list of Sensor objects,
   * including their corresponding dimensions and indices 
   * to be passed to the data-bar components.
   * 
   * @param channels a string where each character specifies a sensor channel
   */
  private setupSensors(channels: string): Sensor[] {
    // creates the Sensor object for each channel provided
    let toSensor = (channel: string, id: number): Sensor => {
      const name = this.SENSOR_NAMES[channel];
      const dims = this.SENSOR_DIMS[channel];
      const idxs = this.idx_map.get(id);
      const hide = false;
      const labelstream = this.default_stream;
      return new Sensor(id, name, dims, idxs, hide, labelstream, channel);
    }
    return [...channels].map(toSensor)
  }
  // #endregion
}
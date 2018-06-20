// #region [Imports]
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { saveAs } from 'file-saver/FileSaver';
import { DataloaderService } from '../data-loader/data-loader.service';
import { WorkspaceInfo, DataInfo, TypeMap } from '../data-loader/workspace-info';
import { SettingsService } from '../settings/settings.service';
import { Label, LabelStream} from './labelstreams/labelstream';
import { ToolMode, ModeTracker } from './modes/tool-mode';
import { Colorer } from './types/colorer';
import { Sensor } from './sensor';
import { EventMap, LabelKey } from './types/event-types';
// #endregion

// #region [Interfaces]
interface SensorInfo {
  name: string;
  index: number;
  channel?: string;
}

type ArrayLike = Float32Array | Int32Array | Uint8Array | number[] | any[]

type LabelStreamMap = { [name: string]: LabelStream }

type IdxEntries = [number, number[]][]
type IndexMap = Map<number,number[]>
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
  // #region [Properties]
  TOOL_MODE = ToolMode;
  dataset: string;
  workspace: string;
  info: WorkspaceInfo;
  data_info: DataInfo;
  sensors: Sensor[];
  zoom_transform;
  labelStreams: LabelStreamMap = {};
  mode: ModeTracker;
  colorer: Colorer;
  print_ls: string;
  private _idx_map: Map<number,number[]>;
  // #endregion

  // #region [Constructors]
  constructor(private route: ActivatedRoute, 
              private dataloader: DataloaderService,
              private _settings: SettingsService) { 
    this.mode = new ModeTracker();
  }

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
    // create label-streams based on event-maps
    for (let emap of this.event_maps) {
      this.addStream(emap.name, emap);
    }
    // parse labels (when ready)
    if (this.is_labelled) {
      let _labels = this.dataloader.getLabels(this.dataset);
      this.parse_labels(_labels)
          .then((labels) => { this.setLabels(this.default_stream, labels) })
    }
    // add user-labels stream, setup default save-lbls stream
    this.addStream('user-labels');
    this.print_ls = this.default_stream;
    // component initialized
    console.info('dataview initialized', this);
  }

  ngAfterViewInit() {
    console.debug('dataview children initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Accessors]
  get is_labelled(): boolean { return !!this.data_info.labelled }

  get eventMap(): TypeMap {
    if (!this.is_labelled) return {}
    const ds = this.data_info.labelled as string;
    return this.info._labels[ds]['event-map'];
  }

  get default_stream(): string {
    if (!this.is_labelled) return "user-labels";
    return this.data_info.labelled as string;
  }

  get streams(): string[] { return Object.keys(this.labelStreams) }

  get channels() { return this.data_info.channels }

  get known_sensors(): SensorInfo[] {
    let channels = this.data_info.channels;
    return [...channels].map((c,i) => { return {name: Sensor.SENSOR_NAMES[c], index: i, channel: c} })
  }

  get idx_map(): IndexMap {
    if (!this._idx_map) 
      this._idx_map = Sensor.gen_idx_map(this.data_info.channels);
    return this._idx_map;
  }

  get settings() { return this._settings; }

  get event_maps() {
    return this.info.labelschemes.map((scheme) => {return new EventMap(scheme)})
  }
  // #endregion

  // #region [Label Streams]
  private addStream(name: string, emap: EventMap = undefined) {
    emap = emap || new EventMap({name})
    this.labelStreams[name] = new LabelStream(name, [], emap);
  }

  private setLabels(name: string, labels: Label[]) {
    this.labelStreams[name].set_labels(labels);
  }
  // #endregion

  // #region [Sensors]
  private get_channel(id) {
    if (id >= this.channels.length) id = 0;
    return [...this.channels][id] 
  }

  private next_id() {
    let toID = (s: Sensor) => s.id;
    let maxID = (max, cur) => Math.max(max, cur);
    let nxt_id = this.sensors.map(toID).reduce(maxID, -1) + 1;
    return nxt_id;
  }
  // #endregion

  // #region [Event Handlers]
  onZoom(event) { this.zoom_transform = event.transform }

  hide(sensor: Sensor) { sensor.hide() }

  show(sensor: Sensor) { sensor.show() }

  remove(sensor: Sensor) { 
    console.debug('REMOVING SENSOR', sensor);
    this.sensors = this.sensors.filter((s) => { return s.id !== sensor.id })
  }

  changeSensor(sensor: Sensor, to: SensorInfo) { sensor.update(to) }

  newSensor() {
    let id = this.next_id();
    let c = this.get_channel(id);
    let sensor = new Sensor(c, id, this.default_stream, this.idx_map);
    console.debug('Adding new sensor:', sensor);
    this.sensors.push(sensor);
  }

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
      console.log('default label stream:', this.default_stream);
      console.log('event maps:', this.event_maps);
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
   * Takes the channel string and returns an ordered list of Sensor objects
   * 
   * @param channels a string where each character specifies a sensor channel
   */
  private setupSensors(channels: string): Sensor[] {
    let topSensors = (_, i) => { return i < this.settings.max_sensors }   // limit number of sensors shown at once
    let toSensor = (channel: string, id: number): Sensor => {             // creates the Sensor object for each channel provided
      return new Sensor(channel, id, this.default_stream, this.idx_map);
    }
    return [...channels].filter(topSensors).map(toSensor)
  }
  // #endregion
}
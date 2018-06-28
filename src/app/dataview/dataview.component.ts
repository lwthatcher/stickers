// #region [Imports]
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, HostListener } from '@angular/core';
import { DataloaderService } from '../data-loader/data-loader.service';
import { WorkspaceInfo, DataInfo, TypeMap } from '../data-loader/workspace-info';
import { SettingsService } from '../settings/settings.service';
import { Label, LabelStream} from './labelstreams/labelstream';
import { ModeTracker } from './modes/tool-mode';
import { Colorer } from './types/colorer';
import { Sensor } from './sensors/sensor';
import { EventMap } from './types/event-types';
import { Dataset } from '../data-loader/dataset';
// #endregion

// #region [Interfaces]
interface SensorInfo {
  name: string;
  index: number;
  channel?: string;
}

interface datum {
  d: number;
  i: number;
  t?: Date;
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
  ds: string;
  ws: string;
  workspace: WorkspaceInfo;
  dataset: Promise<Dataset>;
  info: DataInfo;
  sensors: Sensor[];
  zoom_transform;
  labelStreams: LabelStreamMap = {};
  mode: ModeTracker;
  colorer: Colorer;
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
    this.ws = this.route.snapshot.paramMap.get('workspace');
    this.ds = this.route.snapshot.paramMap.get('dataset');
    // get resolved data
    this.workspace = this.route.snapshot.data.workspace[0];
    this.info = this.workspace.getDataInfo(this.ds);
    // setup helper class(es)
    this.colorer = new Colorer(this);
    // create list of Sensor objects
    this.sensors = this.setupSensors(this.info.channels);
    // specify which data to load
    this.dataset = this.dataloader.loadDataset(this.info);
    // create label-streams based on event-maps
    for (let emap of this.event_maps) {
      this.addStream(emap.name, emap);
    }
    // parse labels (when ready)
    if (this.is_labelled) {
      let _labels = this.dataloader.labels(this.ds);
      this.parse_labels(_labels)
          .then((labels) => { this.setLabels(this.default_stream, labels) })
    }
    // add user-labels stream
    this.addStream('user-labels');
    // component initialized
    console.info('dataview initialized', this);
  }

  ngAfterViewInit() {
    console.debug('dataview children initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Accessors]
  get is_labelled(): boolean { return !!this.info.labelled }

  get eventMap(): TypeMap {
    if (!this.is_labelled) return {}
    const ds = this.info.labelled as string;
    return this.workspace._labels[ds]['event-map'];
  }

  get default_stream(): string {
    if (!this.is_labelled) return "user-labels";
    return this.info.labelled as string;
  }

  get streams(): string[] { return Object.keys(this.labelStreams) }

  get channels() { return this.info.channels }

  get idx_map(): IndexMap {
    if (!this._idx_map) 
      this._idx_map = Sensor.gen_idx_map(this.info.channels);
    return this._idx_map;
  }

  get settings() { return this._settings; }

  get event_maps() {
    return this.workspace.labelschemes.map((scheme) => {return new EventMap(scheme)})
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
    console.debug('removing sensor:', sensor);
    this.sensors = this.sensors.filter((s) => { return s.id !== sensor.id })
  }

  removeStream(stream: string) {
    console.log('deleting labelstream:', stream);
    for (let sensor of this.sensors) {
      if (sensor.labelstream === stream) {
        let newstream = this.nextStream(stream);
        sensor.labelstream = newstream;
        console.debug('changing sensor labelstream:', sensor.name, newstream);
      }
    }
    delete this.labelStreams[stream];
  }

  newSensor() {
    let id = this.next_id();
    let c = this.get_channel(id);
    let sensor = new Sensor(c, id, this.default_stream, this.idx_map);
    console.debug('Adding new sensor:', sensor);
    this.sensors.push(sensor);
  }

  @HostListener('document:keypress', ['$event'])
  keyPress(event) {
    if (event.key === 'i') this.logInfo();
  }
  // #endregion

  // #region [Data Loading]
  parse_labels(labeldata: Promise<datum[]>): Promise<Label[]> {
    return labeldata.then((data) => this.boundaries(data))
                    .then((labels) => this.filterNullLabels(labels));
  }

  private addStream(name: string, emap: EventMap = undefined) {
    this.labelStreams[name] = new LabelStream(name, [], emap);
  }

  private setLabels(name: string, labels: Label[]) {
    this.labelStreams[name].set_labels(labels);
  }

  private filterNullLabels(labels: Label[]) {
    let ls = this.labelStreams[this.default_stream];
    if (!this.settings.filter_nulls) return labels;
    else return labels.filter((lbl) => lbl.label !== ls.emap.null_label);
  }
  // #endregion

  // #region [Helper Methods]
  private logInfo() {
    console.groupCollapsed('Dataview');
    console.log('name:', this.ws);
    console.groupCollapsed('workspace info');
      console.log('dataset name:', this.ds);
      console.log('data info:', this.info);
      console.log('workspace info:', this.workspace);
    console.groupEnd();
    console.groupCollapsed('sensors');
      console.log('sensors:', this.sensors);
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
   * Gets which stream to switch to when the specified stream is removed.
   */
  private nextStream(stream: string) {
    let streams = this.streams.filter((s) => s !== stream);
    return streams[0];
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
   * Infers discrete event start/end times from a stream of datum readings
   * 
   * @param lbls the stream of label datum readings
   */
  private boundaries(lbls: ArrayLike): Label[] {
    // helper functions
    let boundaryChange = (entry,i,arr) => {
      if (i === 0) {console.debug('BC', entry)}
      return arr[i-1] && entry[1].d != arr[i-1][1].d
    }
    let convert = (entry,j,arr) => {
      let [i1,d1] = entry;
      let [i2,d2] = arr[j+1] || lbls[lbls.length-1];
      let result = {start:d1.i, end:d2.i, label:d1.d} as Label;
      if (d1.d in this.eventMap) result.type = this.eventMap[d1.d];
      return result;
    }
    // format from ArrayLike -> array of tuples: [index, label]
    lbls = Array.from(lbls);            // make sure its an Array (not TypedArray)
    lbls = Array.from(lbls.entries());  // look at both the value and index
    // find boundaries (points where the values changed)
    let boundaries = lbls.filter(boundaryChange)
    boundaries.unshift(lbls[0])         // add the first point
    // converts to list of Label objects
    let result = boundaries.map(convert);
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
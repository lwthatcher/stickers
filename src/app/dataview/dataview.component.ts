// #region [Imports]
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, HostListener, ViewChildren, ViewChild, 
         ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { DataloaderService } from '../data-loader/data-loader.service';
import { WorkspaceInfo, TypeMap } from '../data-loader/info/workspace-info';
import { LabelScheme } from "../data-loader/info/label-scheme";
import { DataInfo } from "../data-loader/info/data-info";
import { SettingsService } from '../settings/settings.service';
import { Label, LabelStream} from './labelstreams/labelstream';
import { ModeTracker } from './modes/tool-mode';
import { Colorer } from './event-types/colorer';
import { Sensor } from './sensors/sensor';
import { Dataset } from '../data-loader/dataset';
import { LabelsLoaderService } from '../data-loader/labels-loader.service';
import { TypesToolboxComponent } from './event-types/types-toolbox.component';
import { SensorsToolboxComponent } from './sensors/sensors-toolbox.component';
import { ModesToolboxComponent } from './modes/modes-toolbox.component';
import { LabelstreamToolboxComponent } from './labelstreams/labelstreams-toolbox.component';
import { DatabarComponent } from './databar/databar.component';
import { EnergyWellsTracker } from './energy/energy-wells';
import { EnergyWellToolboxComponent } from './energy/energy-well-toolbox.component';
import { VideoComponent } from './video/video.component';
import { VideoTracker } from './video/video-tracker';
// #endregion

// #region [Interfaces]
interface datum {
  d: number;
  i: number;
  t?: Date;
}

type ArrayLike = Float32Array | Int32Array | Uint8Array | number[] | any[]
type LabelStreamMap = { [name: string]: LabelStream }
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
export class DataviewComponent implements OnInit, AfterViewChecked {
  // #region [Child Components]
  @ViewChildren(TypesToolboxComponent) tbTypes;
  @ViewChildren(SensorsToolboxComponent) tbSensors;
  @ViewChildren(ModesToolboxComponent) tbModes;
  @ViewChildren(LabelstreamToolboxComponent) tbLblStreams;
  @ViewChildren(EnergyWellToolboxComponent) tbEnergyWells;
  @ViewChildren(DatabarComponent) _databars;
  @ViewChild(VideoComponent) video;
  // #endregion

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
  energy: EnergyWellsTracker;
  vt: VideoTracker;
  private _idx_map: Map<number,number[]>;
  // #endregion

  // #region [Constructors]
  constructor(private route: ActivatedRoute, 
              private dataloader: DataloaderService,
              private labelsloader: LabelsLoaderService,
              private _settings: SettingsService,
              private cdRef:ChangeDetectorRef) { 
    this.mode = new ModeTracker();
  }

  ngOnInit() {
    console.groupCollapsed('dataview init')
    // get parameters
    this.ws = this.route.snapshot.paramMap.get('workspace');
    this.ds = this.route.snapshot.paramMap.get('dataset');
    // get resolved data
    this.workspace = this.route.snapshot.data.workspace;
    this.info = this.workspace.getData(this.ds);
    // setup helper class(es)
    this.colorer = new Colorer(this);
    // create label-streams
    for (let scheme of this.labelschemes) { this.addStream(scheme.name, scheme) }
    this.addStream('user-labels');
    // create list of Sensor objects
    this.sensors = this.setupSensors(this.info.channels);
    // specify which data to load
    this.dataset = this.dataloader.loadDataset(this.info);
    // load external labels files
    for (let scheme of this.workspace.labelschemes) {
      if (scheme.hasLabels) {
        let lbls = this.labelsloader.loadLabels(this.ds, scheme);
        lbls.subscribe((l) => { this.setLabels(scheme.name, l) })
      }
    }
    // load labels from dataset if no other option
    if (this.is_labelled && !this.default_stream.scheme.hasLabels) {
      let _labels = this.dataloader.labels(this.ds);
      this.parse_labels(_labels)
          .then((labels) => { this.setLabels(this.default_stream.name, labels) })
    }
    // load energy if available
    this.energy = new EnergyWellsTracker(this.dataloader, this.workspace);
    // component initialized
    console.info('dataview initialized', this);
  }

  ngAfterViewInit() {
    this.vt = new VideoTracker(this.video);
    console.debug('dataview children initialized', this);
    console.groupEnd();
  }

  /** This prevents errors from changing the playback rate */
  ngAfterViewChecked() { this.cdRef.detectChanges() }
  // #endregion

  // #region [Accessors]
  get is_labelled(): boolean { return !!this.info.labelled }

  get eventMap(): TypeMap {
    if (!this.is_labelled) return {}
    const ds = this.info.labelled as string;
    return this.workspace._labels[ds]['event-map'];
  }

  get default_stream(): LabelStream {
    if (this.route.snapshot.paramMap.has('labels'))
      return this.labelStreams[this.route.snapshot.paramMap.get('labels')]
    else if (!this.is_labelled) 
      return this.labelStreams['user-labels'];
    console.log('DEFAULT STREAM', this.route.snapshot);
    return this.labelStreams[<string>this.info.labelled];
  }

  get streams(): string[] { return Object.keys(this.labelStreams) }

  get channels(): string { return this.info.channels }

  get idx_map(): IndexMap {
    if (!this._idx_map) 
      this._idx_map = Sensor.gen_idx_map(this.channels);
    return this._idx_map;
  }

  get settings() { return this._settings }

  get labelschemes() { return this.workspace.labelschemes }

  get databars() { return this._databars.toArray() }
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
    let sensor = new Sensor(c, id, this.default_stream.name, this.idx_map);
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

  private addStream(name: string, scheme: LabelScheme = undefined) {
    if (!scheme) scheme = this.workspace.EMPTY_SCHEME(name);
    this.labelStreams[name] = new LabelStream(name, scheme);
  }

  private setLabels(name: string, labels: Label[]) {
    console.debug('setting labels:', name, labels);
    this.labelStreams[name].set_labels(labels);
  }

  private filterNullLabels(labels: Label[]) {
    let ls = this.default_stream;
    if (!this.settings.filter_nulls) return labels;
    else return labels.filter((lbl) => lbl.label !== ls.emap.null_label);
  }
  // #endregion

  // #region [Helper Methods]
  private logInfo() {
    console.groupCollapsed('Dataview');
    console.log('name:', this.ws);
    console.groupCollapsed('workspace info');
      console.log('data info:', this.info);
      console.log('workspace info:', this.workspace);
    console.groupEnd();
    console.groupCollapsed('children');
      console.log('video', this.video);
      console.log('sensors-toolboxes', this.tbSensors.toArray());
      console.log('labelstreams-toolboxes', this.tbLblStreams.toArray());
      console.log('modes-toolboxes', this.tbModes.toArray());
      console.log('types-toolboxes', this.tbTypes.toArray());
      console.log('energy-wells-toolboxes', this.tbEnergyWells.toArray());
    console.groupEnd()
    console.groupCollapsed('sensors');
      console.log('sensors:', this.sensors);
    console.groupEnd();
    console.groupCollapsed('label streams');
      console.log('label streams:', this.labelStreams);
      console.log('num observers:', this.getObservers());
      console.log('default label stream:', this.default_stream);
      console.log('label schemes:', this.labelschemes);
    console.groupEnd();
    console.groupCollapsed('data')
      console.log('dataset name:', this.ds);
      console.log('dataset:', this.dataset);
      console.log('energy:', this.energy);
    console.groupEnd()
    console.log('dataview component', this);
    console.groupEnd();
    for (let databar of this.databars) { databar.logInfo(); }
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
    let boundaryChange = (entry,i,arr) => { return arr[i-1] && entry[1].d != arr[i-1][1].d }
    let convert = (entry,j,arr) => {
      let [i1,d1] = entry;
      let [i2,d2] = arr[j+1] || lbls[lbls.length-1];
      let emap = this.default_stream.emap;
      let result = {start:d1.i, end:d2.i, label:d1.d, type: emap.get(d1.d)} as Label;
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
      return new Sensor(channel, id, this.default_stream.name, this.idx_map);
    }
    return [...channels].filter(topSensors).map(toSensor)
  }
  // #endregion
}
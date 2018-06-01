// #region [Imports]
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { DataloaderService } from '../data-loader/data-loader.service';
import { WorkspaceInfo, DataInfo } from '../data-loader/workspace-info';
import { Label, LabelStream } from './databar/labeller';
// #endregion

// #region [Interfaces]
export interface Sensor {
  id: number;
  name: string;
  idxs: number[];
  dims: string[];
  hide: boolean;
}

type ArrayLike = Float32Array | Int32Array | Uint8Array | number[] | any[]
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
  // #endregion

  // #region [Accessors]
  get visibleSensors() { return this.sensors.filter((s) => !s.hide) }

  get is_labelled() { return !!this.data_info.labelled }

  get eventMap() {
    if (!this.data_info.labelled) return {}
    const ds = this.data_info.labelled as string;
    return this.info.labels[ds]['event-map']
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
  labelStreams: LabelStream[] = [];
  // #endregion

  // #region [Constructors]
  constructor(private route: ActivatedRoute, private dataloader: DataloaderService) { }

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
      this.parse_labels(_labels);
    }
    // component initialized
    console.info('dataview initialized', this);
  }

  ngAfterViewInit() {
    console.debug('dataview children initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Label Streams]
  getLabelStream(name) {
    return this.labelStreams.find((stream) => { return stream.name === name })
  }
  // #endregion

  // #region [Event Handlers]
  onZoom(event) { this.zoom_transform = event.transform }

  hide(sensor: Sensor) { this.sensors[sensor.id].hide = true }

  show(sensor: Sensor) { this.sensors[sensor.id].hide = false }

  @HostListener('document:keypress', ['$event'])
  keyPress(event) {
    if (event.key === 'i') this.logInfo();
  }
  // #endregion

  // #region [Data Loading]
  parse_labels(labels: Promise<ArrayLike>) {
    labels.then((lbls) => {return this.boundaries(lbls)})
          .then((boundaries) => { return boundaries.filter((lbl) => lbl.label !== 0) })
          .then((labels) => { this.labels = labels; this.labelStreams.push(new LabelStream('default', labels)) })
  }
  // #endregion

  // #region [Helper Methods]
  private logInfo() {
    console.groupCollapsed('Workspace Info');
    console.log('name:', this.workspace);
    console.log('dataset name:', this.dataset);
    console.log('info:', this.info);
    console.log('data info:', this.data_info);
    console.log('sensors', this.sensors);
    console.log('visible sensors', this.visibleSensors);
    console.log('component', this);
    console.groupEnd();
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
    let toSensor = (channel: string ,idx) => {
      const name = this.SENSOR_NAMES[channel];
      const dims = this.SENSOR_DIMS[channel];
      return {name, channel, dims, hide:false, id:idx}
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
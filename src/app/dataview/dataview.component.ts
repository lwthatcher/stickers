import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { DataloaderService } from '../data-loader/data-loader.service';
import { WorkspaceInfo, DataInfo } from '../data-loader/workspace-info';

export interface Sensor {
  id: number;
  name: string;
  idxs: number[];
  dims: string[];
  hide: boolean;
}

@Component({
  selector: 'app-dataview',
  templateUrl: 'dataview.component.html',
  styleUrls: ['dataview.component.css'],
  providers: [DataloaderService]
})
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
  get visible_sensors() { return this.sensors.filter((s) => !s.hide) }

  get is_labelled() { return !!this.data_info.labelled }
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
  _labels;
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
      this._labels = this.dataloader.getLabels(this.dataset);
      this.parse_labels(this._labels);
    }
    // component initialized
    console.info('dataview initialized', this);
  }

  ngAfterViewInit() {
    console.debug('dataview children initialized', this);
    console.groupEnd();
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

  // #region [Helper Methods]
  private logInfo() {
    console.groupCollapsed('Workspace Info');
    console.log('name:', this.workspace);
    console.log('dataset name:', this.dataset);
    console.log('info:', this.info);
    console.log('data info:', this.data_info);
    console.log('sensors', this.sensors);
    console.log('visible sensors', this.visible_sensors);
    console.log('component', this);
    console.groupEnd();
  }

  private parse_labels(lbls: Promise<any>) {
    lbls.then((l) => {return this.labelBoundaries(l)})
        .then((l) => {console.log('BOUNDARIES', l)})
  }

  private labelBoundaries(lbls) {
    // in-line functions
    let boundaryChange = (v,i,arr) => { return arr[i-1] && v[1] != arr[i-1][1] }
    let convert = (v,j,arr) => {
      let [i1,l1] = v;
      let [i2,l2] = arr[j+1] || lbls[lbls.length-1];
      return [i1, i2, l1];
    }
    // format labels
    lbls = Array.from(lbls);            // make sure its an Array (not TypedArray)
    lbls = Array.from(lbls.entries());  // look at both the value and index
    // find boundaries (points where the values changed)
    let boundaries = lbls.filter(boundaryChange)
    boundaries.unshift(lbls[0])         // add the first point
    // converts to a tuple: [start, end, label]
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
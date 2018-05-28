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
  styles: []
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
    console.info('dataview initialized', this);
  }

  ngAfterViewInit() {
    console.debug('dataview children initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Event Handlers]
  onZoom(event) { this.zoom_transform = event.transform }

  onUpdateSensor(event) { this.sensors[event.id] = event }

  hide(sensor: Sensor) {
    this.sensors[sensor.id].hide = true;
  }

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
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { DataloaderService } from '../data-loader/data-loader.service';
import { WorkspaceInfo, DataInfo } from '../data-loader/workspace-info';

interface Sensor {
  name: string;
  idxs: number[];
  dims: string[];
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

  SENSOR_LENGTH_MAP = {
    'A': [0, 1, 2],
    'G': [3, 4, 5],
    'C': [6, 7, 8],
    'L': [9, 10],
    'B': [11, 12]
  }

  SENSOR_NAMES = {
    'A': 'Accelerometer',
    'G': 'Gyroscope',
    'C': 'Compass',
    'L': 'Light',
    'B': 'Barometer'
  }
  // #endregion

  // #region [Properties]
  databarHeight = 200;
  downsample = true;
  dataset: string;
  workspace: string;
  info: WorkspaceInfo;
  data_info: DataInfo;
  zoom_transform;
  // #endregion

  // #region [Accessors]
  get sensors() {
    let result = []
    let r2 = this.gen_sensors(this.data_info.channels);
    console.log('SENSORS', r2);
    for (let s of this.data_info.channels) { result.push(s) }
    return result
  }
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
    console.log('component', this);
    console.groupEnd();
  }

  private gen_sensors(channels: string): Sensor[] {
    let toSensor = (channel,idx,arr) => {
      let name = this.SENSOR_NAMES[channel];
      let dims = this.SENSOR_DIMS[channel];
      return {name, channel, dims}
    }
    let len = (sensor) => sensor.dims.length  // map -> # of sensors
    let sum = (acc, cur) => acc + cur         // reduce -> sum over array

    let getIdxs = (sensor,i,arr) => {
      let so_far = arr.slice(0,i).map(len).reduce(sum, 0)
      let idx = sensor.dims.map((_,i) => so_far+i);
      sensor.idx = idx;
      return sensor;
    }
    return [...channels].map(toSensor).map(getIdxs)
  }
  // #endregion
}
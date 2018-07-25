import { Component, OnInit, Input } from '@angular/core';
import { Sensor } from './sensor';

// #region [Interfaces]
interface SensorInfo {
  name: string;
  index: number;
  channel?: string;
}
// #endregion

@Component({
  selector: 'toolbox-sensors',
  templateUrl: './sensors-toolbox.component.html',
  styleUrls: ['./sensors-toolbox.component.scss']
})
export class SensorsToolboxComponent implements OnInit {
  // #region [Inputs]
  @Input() sensor: Sensor;
  @Input() channels: string;
  // #endregion

  // #region [Constructors]
  sensors: SensorInfo[];
  constructor() { }

  ngOnInit() {
    this.sensors = [...this.channels].map(this.getInfo)  
  }
  // #endregion

  // #region [Callbacks]
  get getInfo() { return (c,i) => {return {name: Sensor.SENSOR_NAMES[c], channel: c, index: i}} }
  // #endregion

  // #region [Public Methods]
  changeSensor(to: SensorInfo) { this.sensor.update(to) }

  quack() { console.log('quack!') }
  // #endregion
}

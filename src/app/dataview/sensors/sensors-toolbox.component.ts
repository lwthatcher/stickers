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
  styleUrls: ['./sensors-toolbox.component.css']
})
export class SensorsToolboxComponent implements OnInit {
  // #region [Inputs]
  @Input() sensor: Sensor;
  @Input() channels: string;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    console.groupCollapsed('sensors-toolbox init', this.sensor.name);
    console.info('sensors-toolbox initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Accessors]
  get known_sensors(): SensorInfo[] {
    let channels = this.channels;
    return [...channels].map((c,i) => { return {name: Sensor.SENSOR_NAMES[c], index: i, channel: c} })
  }
  // #endregion

  // #region [Public Methods]
  changeSensor(sensor, s) {
    console.log('change sensor', sensor, s);
  }
  // #endregion
}

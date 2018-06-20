import { Component, OnInit, Input } from '@angular/core';
import { Sensor } from '../sensor';
import { LabelStream } from './labelstream';

// #region [Interfaces]
type LabelStreamMap = { [name: string]: LabelStream }
// #endregion

@Component({
  selector: 'toolbox-labelstreams',
  templateUrl: './labelstreams-toolbox.component.html',
  styleUrls: ['labelstreams-toolbox.component.css']
})
export class LabelstreamToolboxComponent implements OnInit {
  // #region [Variables]

  // #endregion

  // #region [Inputs]
  @Input() sensor: Sensor;
  @Input() labelstreams: LabelStreamMap;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
  }
  // #endregion

  // #region [Accessors]
  get streams(): string[] { return Object.keys(this.labelstreams) }
  // #endregion

  // #region [Public Methods]
  toggleLabels(sensor: Sensor) {

  }

  selectStream(sensor: Sensor, stream: string) {

  }
  // #endregion
}

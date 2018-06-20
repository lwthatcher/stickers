import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Sensor } from '../sensor';
import { LabelStream } from './labelstream';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

// #region [Interfaces]
type LabelStreamMap = { [name: string]: LabelStream }
// #endregion

@Component({
  selector: 'toolbox-labelstreams',
  templateUrl: './labelstreams-toolbox.component.html',
  styleUrls: ['labelstreams-toolbox.component.css']
})
export class LabelstreamToolboxComponent implements OnInit {
  // #region [Inputs]
  @Input() sensor: Sensor;
  @Input() labelstreams: LabelStreamMap;
  @ViewChild('dropdown') dropdown: NgbDropdown;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    console.groupCollapsed('labelstreams-toolbox init', this.sensor.name);
    console.debug('dropdown', this.dropdown);
    console.info('labelstreams-toolbox initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Accessors]
  get streams(): string[] { return Object.keys(this.labelstreams) }
  // #endregion

  // #region [Public Methods]
  toggleLabels() { this.sensor.toggle_labels() }

  selectStream(stream: string) { 
    this.sensor.labelstream = stream;
    this.dropdown.close();
  }

  newStream() {
    console.log('oh look, you clicked on the new stream button!')
  }
  // #endregion
}

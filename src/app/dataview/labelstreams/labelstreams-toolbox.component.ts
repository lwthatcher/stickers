import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Sensor } from '../sensor';
import { LabelStream } from './labelstream';
import { NgbDropdown, NgbPopover } from '@ng-bootstrap/ng-bootstrap';

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
  @ViewChild('popover') popover: NgbPopover;
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

  valid_name(name: string) { return name.length > 0 }

  selectStream(stream: string) {
    this.sensor.labelstream = stream;
    this.dropdown.close();
  }

  add_stream(stream: string) {
    if (!this.valid_name(stream)) { return }
    console.debug('new stream:', stream);
    this.labelstreams[stream] = new LabelStream(stream);
    this.sensor.labelstream = stream;
    this.popover.close();
    this.dropdown.close();
  }

  remove_stream(stream: string, event) {
    event.stopPropagation();
    console.log('remove stream:', stream);
    this.dropdown.close();
  }
  // #endregion
}

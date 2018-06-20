import { Component, OnInit, Input } from '@angular/core';
import { ToolMode, ModeTracker } from './tool-mode';
import { Sensor } from '../sensors/sensor';

@Component({
  selector: 'toolbox-modes',
  templateUrl: 'modes-toolbox.component.html',
  styles: [':host { padding-left: 20px; }']
})
export class ModesToolboxComponent implements OnInit {

  // #region [Variables]
  mode: ToolMode;
  TOOL_MODE = ToolMode;
  // #endregion

  // #region [Inputs]
  @Input() sensor: Sensor;
  @Input() tracker: ModeTracker;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    console.groupCollapsed('modes-toolbox init', this.sensor.name);
    this.mode = this.tracker.current;
    this.tracker.event.subscribe((mode) => this.tracked(mode))
    console.info('modes-toolbox initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Event Handlers]
  changed(mode: ToolMode) { this.tracker.update(mode) }

  tracked(mode: ToolMode) { this.mode = mode }
  // #endregion
}

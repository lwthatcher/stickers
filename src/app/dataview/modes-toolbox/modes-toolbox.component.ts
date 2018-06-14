import { Component, OnInit, Input } from '@angular/core';
import { ToolMode, ModeTracker } from '../databar/tool-mode.enum';
import { Sensor } from '../sensor';
import { mod } from '@tensorflow/tfjs-core';

@Component({
  selector: 'toolbox-modes',
  templateUrl: 'modes-toolbox.component.html',
  styles: []
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
    console.log('modes-toolbox init!', this);
    this.mode = this.tracker.current;
    this.tracker.event.subscribe((mode) => this.tracked(mode))
  }
  // #endregion

  // #region [Event Handlers]
  changed(mode: ToolMode) {
    console.log('mode change:', mode);
    this.tracker.update(mode);
  }

  tracked(mode: ToolMode) {
    console.log('tracked mode change:', mode, this.mode);
    this.mode = mode;
  }
  // #endregion
}

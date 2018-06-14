import { Component, OnInit, Input } from '@angular/core';
import { ToolMode } from '../databar/tool-mode.enum';
import { Sensor } from '../sensor';

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
  // #endregion

  // #region [Constructors]
  constructor() {
    // have some random initial value
    this.mode = ToolMode.Selection;
  }

  ngOnInit() {
    console.log('modes-toolbox init!', this);
  }
  // #endregion

  // #region [Event Handlers]
  changed(event) {
    console.log('mode change:', event);
  }
  // #endregion
}

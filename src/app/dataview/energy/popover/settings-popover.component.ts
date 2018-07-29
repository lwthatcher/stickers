import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DisplayMode, EnergyWellsTracker, EnergyUpdate } from '../energy-wells';

@Component({
  selector: 'app-energy-settings',
  templateUrl: './settings-popover.component.html'
})
export class EnergySettingsPopover implements OnInit {
  // #region [Properties]
  displayMode: DisplayMode;
  DISPLAY_MODE = DisplayMode;
  // #endregion

  // #region [Inputs]
  @Input() energy: EnergyWellsTracker;
  // #endregion

  // #region [Outputs]
  @Output() done: EventEmitter<string> = new EventEmitter();
  // #endregion

  // #region [Constructors]
  constructor() { }
  ngOnInit() {
    this.displayMode = this.energy.displayMode;
    this.energy.event.subscribe((event) => this.tracked(event));
  }
  // #endregion

  // #region [Event Handlers]
  changed(mode: DisplayMode) { this.energy.updateMode(mode) }

  tracked(event: EnergyUpdate) { if (event.type === 'display-mode') this.displayMode = event.mode }

  clicked() { this.done.emit('close') }
  // #endregion
}

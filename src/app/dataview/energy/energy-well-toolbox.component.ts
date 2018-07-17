import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { EnergyWellsTracker, DisplayMode, EnergyUpdate } from './energy-wells';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ToolMode } from '../modes/tool-mode';

@Component({
  selector: 'toolbox-energy',
  templateUrl: './energy-well-toolbox.component.html',
  styleUrls: ['./energy-well-toolbox.component.css']
})
export class EnergyWellToolboxComponent implements OnInit {
  // #region [Properties]
  displayMode: DisplayMode;
  DISPLAY_MODE = DisplayMode;
  // #endregion

  // #region [Inputs]
  @Input() energy: EnergyWellsTracker;
  @ViewChild('settingsMenu') menu: NgbPopover;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    this.displayMode = this.energy.displayMode;
    this.energy.event$.subscribe((event) => this.tracked(event));
  }
  // #endregion

  // #region [Accessors]
  get name() {
    if (!this.energy.has_energy) {return 'No Energy Data'}
    else return this.energy.name;
  }

  get datasets() {
    if (!this.energy.has_energy) {return []}
    else return this.energy.availableEnergySets;
  }
  // #endregion

  // #region [Event Handlers]
  changed(mode: DisplayMode) { this.energy.updateMode(mode) }

  tracked(event: EnergyUpdate) {
    if (event.type === 'display-mode') this.displayMode = event.mode;
  }

  close() { this.menu.close() }
  // #endregion
}

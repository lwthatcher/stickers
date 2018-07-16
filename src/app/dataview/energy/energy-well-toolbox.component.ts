import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { EnergyWellsTracker } from './energy-wells';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'toolbox-energy',
  templateUrl: './energy-well-toolbox.component.html',
  styleUrls: ['./energy-well-toolbox.component.css']
})
export class EnergyWellToolkitComponent implements OnInit {

  // #region [Inputs]
  @Input() energy: EnergyWellsTracker;
  @ViewChild('settingsMenu') menu: NgbPopover;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    console.log('settings menu', this.menu);
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
}

import { Component, OnInit, Input } from '@angular/core';
import { EnergyWellsTracker } from './energy-wells';

@Component({
  selector: 'toolbox-energy',
  templateUrl: './energy-well-toolbox.component.html',
  styleUrls: ['./energy-well-toolbox.component.css']
})
export class EnergyWellToolkitComponent implements OnInit {

  // #region [Inputs]
  @Input() energy: EnergyWellsTracker;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
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

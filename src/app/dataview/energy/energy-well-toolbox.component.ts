import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { EnergyWellsTracker } from './energy-wells';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Component({
  selector: 'toolbox-energy',
  templateUrl: './energy-well-toolbox.component.html',
  styleUrls: ['./energy-well-toolbox.component.css']
})
export class EnergyWellToolboxComponent implements OnInit {
  // #region [Inputs]
  @Input() energy: EnergyWellsTracker;
  @ViewChild('settingsMenu') sMenu: NgbPopover;
  @ViewChild('computeMenu') cMenu: NgbPopover;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() { }
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
  close(menu: 'settings' | 'compute') { 
    if (menu === 'settings')
      this.sMenu.close() 
    else this.cMenu.close()
  }

  computeEnergy(response) { 
    console.log('compute that energy!', event);
    this.close('compute');
    response.subscribe((d) => {
      console.log('computed energy:', d);
    })
  }
  // #endregion
}

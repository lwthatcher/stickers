import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { EnergyWellsTracker } from './energy-wells';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { DataInfo } from "../../data-loader/info/data-info";
import { EnergyGradientTracker } from './energy-gradient';

@Component({
  selector: 'toolbox-energy',
  templateUrl: './energy-well-toolbox.component.html',
  styleUrls: ['./energy-well-toolbox.component.css']
})
export class EnergyWellToolboxComponent implements OnInit {
  // #region [Inputs]
  @Input() energy: EnergyWellsTracker;
  @Input() gradient: EnergyGradientTracker;
  @ViewChild('settingsMenu') sMenu: NgbPopover;
  @ViewChild('computeMenu') cMenu: NgbPopover;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() { }
  // #endregion

  // #region [Accessors]
  get name() {
    if (!this.gradient.exists) {return 'No Energy-Gradient Data'}
    else return this.gradient.name;
  }

  get datasets() {
    if (!this.gradient.exists) {return []}
    else return this.gradient.availableEnergySets;
  }
  // #endregion

  // #region [Event Handlers]
  close(menu: 'settings' | 'compute') { 
    if (menu === 'settings')
      this.sMenu.close() 
    else this.cMenu.close()
  }

  computeEnergy(response) { 
    this.close('compute');
    response.subscribe((res) => {
      console.log('computed energy:', res);
      let name = res.datum.name;
      let info = this.toDataInfo(res.datum);
      this.energy.energyMap[name] = info;
      this.energy.select(name);
    })
  }
  // #endregion

  // #region [Helper Methods]
  toDataInfo(datum): DataInfo {
    let ws = this.energy.workspace;
    datum.workspace = ws.name;
    return new DataInfo(ws, datum);
  }
  // #endregion
}

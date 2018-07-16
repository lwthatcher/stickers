import { Component, OnInit, Input } from '@angular/core';
import { Dataset } from '../../data-loader/dataset';

@Component({
  selector: 'toolbox-energy',
  templateUrl: './energy-well-toolbox.component.html',
  styleUrls: ['./energy-well-toolbox.component.css']
})
export class EnergyWellToolkitComponent implements OnInit {

  // #region [Inputs]
  @Input() energy: Dataset;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
  }
  // #endregion
}

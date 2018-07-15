import { Component, OnInit, Input } from '@angular/core';
import { Dataset } from '../../data-loader/dataset';

@Component({
  selector: 'app-energy-well-toolkit',
  templateUrl: './energy-well-toolkit.component.html',
  styleUrls: ['./energy-well-toolkit.component.css']
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

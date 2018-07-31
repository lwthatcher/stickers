import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkspaceInfo } from '../../../data-loader/workspace-info';
import { DataInfo } from "../../../data-loader/info/data-info";
import { SaverService } from '../../../saver/saver.service';

@Component({
  selector: 'app-compute-popover',
  templateUrl: './compute-popover.component.html',
  styles: []
})
export class ComputeEnergyPopover implements OnInit {
  // #region [Properties]
  datasets: DataInfo[];
  // #endregion

  // #region [Inputs]
  @Input() workspace: WorkspaceInfo;
  // #endregion

  // #region [Outputs]
  @Output() select = new EventEmitter();
  // #endregion

  // #region [Constructors]
  constructor(private saver: SaverService) { }

  ngOnInit() {
    let filter = (d) => {return !d.isEnergy}
    this.datasets = this.workspace.data.filter(filter);
  }
  // #endregion

  // #region [Event Handlers]
  compute(dataset) {
    console.log('compute energy for:', dataset);
    let response = this.saver.computeEnergy(dataset);
    this.select.emit(response);
  }
  // #endregion
}

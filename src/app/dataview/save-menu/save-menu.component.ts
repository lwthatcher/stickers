import { Component, OnInit, Input } from '@angular/core';
import { LabelStream } from '../labelstreams/labelstream';

// #region [Interfaces]
type LabelStreamMap = { [name: string]: LabelStream }
// #endregion


@Component({
  selector: 'app-save-menu',
  templateUrl: './save-menu.component.html',
  styleUrls: ['./save-menu.component.css']
})
export class SaveMenuComponent implements OnInit {
  // #region [Inputs]
  @Input() labelstreams: LabelStreamMap
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    console.groupCollapsed('save-menu');
    console.info('save-menu initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Accessors]
  get streams(): string[] { return Object.keys(this.labelstreams) }
  // #endregion

  // #region [Public Methods]
  save_labels() {
    console.log('save labels');
  }

  change_ls(stream: string) {
    console.log('selecting stream to save:', stream);
  }
  // #endregion
}

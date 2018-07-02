import { Component, OnInit, Input } from '@angular/core';
import { LabelStream } from '../labelstreams/labelstream';
import { saveAs } from 'file-saver/FileSaver';

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
  @Input() labelstreams: LabelStreamMap;
  @Input() default: string;
  // #endregion

  // #region [Variables]
  selected_stream: string;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    this.selected_stream = this.default;
  }
  // #endregion

  // #region [Accessors]
  get streams(): string[] { return Object.keys(this.labelstreams) }
  // #endregion

  // #region [Public Methods]
  select(stream: string) { this.selected_stream = stream }

  save_labels() {
    let json = this.labelstreams[this.selected_stream].toJSON();
    let name = this.selected_stream + '.labels.json'
    console.info('saving label-stream:', this.selected_stream, name, json);
    let blob = new Blob([json], {type: 'application/json;charset=utf-8'})
    saveAs(blob, name);
  }
  // #endregion
}

import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { Sensor } from '../sensor';
import { Colorer } from '../colorer';
import { LabelStream } from '../labelstream';
import { LabelKey } from './event-types';

// #region [Metadata]
@Component({
  selector: 'toolbox-types',
  templateUrl: 'types-toolbox.component.html',
  styleUrls: ['types-toolbox.component.css']
})
// #endregion
export class TypesToolboxComponent implements OnInit, OnChanges {
  // #region [Variables]
  lbl: LabelKey;
  // #endregion

  // #region [Inputs]
  @Input() sensor: Sensor;
  @Input() colorer: Colorer;
  @Input() labelstream: LabelStream;
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    console.groupCollapsed('types-toolbox init', this.sensor.name);
    this.lbl = this.emap.initial;
    console.debug('initial lbl:', this.lbl);
    console.info('types-toolbox initialized', this);
    console.groupEnd();
  }
  // #endregion

  // #region [Lifecycle Hooks]
  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    let {labelstream} = changes;
    if (labelstream && !labelstream.firstChange) this.stream_changed();
  }
  // #endregion

  // #region [Accessors]
  get emap() { return this.labelstream.emap }

  get event_types() { return this.emap.event_types(true) }
  // #endregion

  // #region [Public Methods]
  style_color(type: LabelKey) {
    let c = this.colorer.lbls(this.labelstream.name).get(type);
    return {"background-color": c};
  }

  event_name(type: LabelKey) {
    return this.emap.get(type)
  }
  // #endregion

  // #region [Event Handlers]
  changed(type: LabelKey) {
    console.debug('label type change:', type);
    this.labelstream.change_type(type);
  }

  stream_changed() {
    console.debug('label-stream change:', this.labelstream);
    this.lbl = this.labelstream.lbl_type;
  }
  // #endregion
}
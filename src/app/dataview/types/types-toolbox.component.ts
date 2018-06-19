import { Component, OnInit, Input, OnChanges, SimpleChange, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Sensor } from '../sensor';
import { Colorer } from './colorer';
import { LabelStream } from '../labelstream';
import { LabelKey } from './event-types';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import * as d3 from "d3";

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
  registration;
  // #endregion

  // #region [Inputs]
  @Input() sensor: Sensor;
  @Input() colorer: Colorer;
  @Input() labelstream: LabelStream;
  @ViewChild('addMenu') addMenu: NgbPopover;
  @ViewChildren('editMenu') editMenus: QueryList<NgbPopover>;
  @ViewChildren('event') events: any[];
  // #endregion

  // #region [Constructors]
  constructor() { }

  ngOnInit() {
    console.groupCollapsed('types-toolbox init', this.sensor.name);
    this.lbl = this.emap.initial;
    console.debug('initial lbl:', this.lbl);
    this.register_lblstream();
    console.log('popovers', this.addMenu, this.editMenus);
    console.log('events', this.events);
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

  get menus() {
    return this.editMenus.toArray()
  }
  // #endregion

  // #region [Public Methods]
  style_color(type: LabelKey) {
    let c = this.colorer.labels(this.labelstream.name).get(type);
    return {"background-color": c};
  }

  event_name(type: LabelKey) {
    return this.emap.get(type)
  }

  add_type(name: string) {
    if (name.length > 0) {
      console.log('adding type:', name);
      this.emap.add(name);
    }
    else console.warn('cannot add type with no name:', name);
    this.addMenu.close();
  }

  edit_type(name: string) {
    console.log('saving event type changes:', name);
  }
  // #endregion

  // #region [Event Handlers]
  changed(type: LabelKey) {
    console.debug('label type change:', type);
    this.labelstream.change_type(type);
  }

  stream_changed() {
    this.register_lblstream();
    console.debug('label-stream change:', this.labelstream);
    this.lbl = this.labelstream.lbl_type.toString();
  }

  stream_update(event) {
    if (event === 'change-type') 
      this.lbl = this.labelstream.lbl_type.toString();
  }

  openEditMenu(type, event) {
    let idx = this.emap.index(type);
    event.preventDefault();
    this.closeOtherMenus(idx);
  }
  // #endregion

  // #region [Registrations]
  private register_lblstream() {
    if (!this.labelstream) return false;
    if (this.registration) this.registration.unsubscribe();
    this.registration = this.labelstream.event.subscribe((e) => { this.stream_update(e) })
    return true;
  }
  // #endregion

  // #region [Helper Methods]
  private closeOtherMenus(idx) {
    // close add menu
    this.addMenu.close();
    // close edit menus
    for (let i = 0; i < this.menus.length; i++) {
      if (i !== idx) this.menus[i].close();
    }
  }
  // #endregion
}
import { Component, OnInit, Input, OnChanges, SimpleChange, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Sensor } from '../sensors/sensor';
import { Colorer } from './colorer';
import { LabelStream } from '../labelstreams/labelstream';
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
    this.lbl = this.emap.initial;
    this.register_lblstream();
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

  get menus() { return this.editMenus.toArray() }

  get hasEditMenu() { return this.menus.some((menu) => menu.isOpen()) }
  // #endregion

  // #region [Public Methods]
  style_color(type: LabelKey) {
    let c = this.colorer.labels(this.labelstream.name).get(type);
    return {"background-color": c};
  }

  event_name(type: LabelKey): string { return this.emap.get(type) }

  can_delete(type: LabelKey): boolean {
    if (this.emap.isNull(type)) return false;
    let num = this.labelstream.findType(type);
    return num.length === 0;
  }

  any_changes(type, name) { return name !== this.event_name(type) }

  valid_name(name: string) { return name.length > 0 }

  add_type(name: string): void {
    if (!this.valid_name(name)) { return }
    let lbl = this.emap.add(name);
    this.labelstream.emit('add-type', name);
    this.labelstream.change_type(lbl);
    this.addMenu.close();
  }

  edit_type(key: LabelKey, name: string): void {
    let from = this.emap.get(key);
    let lbl = this.emap.edit(key, name);
    this.labelstream.emit('edit-type', {key, from, to: lbl});
    this.labelstream.change_type(lbl);
    this.getMenu(key).close();
  }

  remove_type(type: LabelKey): void {
    console.log('removing label type:', type);
    let lbl = this.emap.remove(type);
    this.labelstream.change_type(lbl);
  }
  // #endregion

  // #region [Event Handlers]
  changed(type: LabelKey) { this.labelstream.change_type(type) }

  stream_changed() {
    this.register_lblstream();
    console.debug('label-stream change:', this.labelstream);
    this.lbl = this.labelstream.eventType.toString();
  }

  stream_update(event) {
    if (event.type === 'change-type') 
      this.lbl = this.labelstream.eventType.toString();
  }

  toggleAddMenu(event) { this.closeOtherMenus() }

  toggleEditMenu(type, event) {
    // prevent default right-click behavior
    event.preventDefault();
    let menu = this.getMenu(type);
    if (menu.isOpen()) { menu.close() }
    else {                              
      menu.open();
      this.closeOtherMenus(type);
      this.labelstream.change_type(type);
    }
  }

  selectEventType(type, event) {
    // ngModel does the actual event selection
    if (!this.hasEditMenu) return;    
    this.toggleEditMenu(type, event);
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
  private closeOtherMenus(type?: LabelKey) {
    // edit-menu
    if (type) {   
      let idx = this.emap.index(type);
      this.addMenu.close();
      for (let i = 0; i < this.menus.length; i++)
        if (i !== idx) this.menus[i].close();
    }
    // add-menu
    else for (let menu of this.menus) { menu.close() }
  }

  private getMenu(type) {
    let idx = this.emap.index(type);
    return this.menus[idx];
  }
  // #endregion
}
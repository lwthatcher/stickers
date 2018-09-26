import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { Sensor } from '../sensors/sensor';
import { LabelStream } from './labelstream';
import { NgbDropdown, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { WorkspaceInfo } from '../../data-loader/info/workspace-info';
import { SaverService } from '../../saver/saver.service';

// #region [Interfaces]
type LabelStreamMap = { [name: string]: LabelStream }

export interface StreamChange {
  stream: string;
  action: string;
}
// #endregion

@Component({
  selector: 'toolbox-labelstreams',
  templateUrl: './labelstreams-toolbox.component.html',
  styleUrls: ['labelstreams-toolbox.component.scss']
})
export class LabelstreamToolboxComponent implements OnInit {
  // #region [Inputs]
  @Input() sensor: Sensor;
  @Input() workspace: WorkspaceInfo;
  @Input() labelstreams: LabelStreamMap;
  @ViewChild('dropdown') dropdown: NgbDropdown;
  @ViewChild('popover') popover: NgbPopover;
  @ViewChildren('editMenu') editMenus: QueryList<NgbPopover>;
  // #endregion

  // #region [Outputs]
  @Output() remove = new EventEmitter<string>();
  @Output() rename = new EventEmitter<[string,string]>();
  // #endregion

  // #region [Constructors]
  constructor(private saver: SaverService) { }

  ngOnInit() { }
  // #endregion

  // #region [Accessors]
  get streams(): string[] { return Object.keys(this.labelstreams) }

  get current(): LabelStream { return this.labelstreams[this.sensor.labelstream] }

  get menus() { return this.editMenus.toArray() }

  get icon(): string {
    if (this.popover.isOpen()) return 'remove'
    else return 'add'
  }
  // #endregion

  // #region [Queries]
  can_remove(stream: string) {
    return this.streams.length > 1 && this.getStream(stream).isEmpty 
  }

  can_save(stream: string) { return this.getStream(stream).changed }
  // #endregion

  // #region [Public Methods]
  toggleLabels() { this.sensor.toggle_labels() }

  save(event) {
    event.stopPropagation();
    let response = this.saver.saveLabels(this.current.scheme, this.current.labels);
    response.subscribe((res) => { console.debug('labels saved:', res) })
    this.current.changed = false;
  }

  merge(stream: string, event) { 
    event.stopPropagation();
    console.log('merge two streams:', this.sensor.labelstream, stream);
  }

  selectStream(stream: string) {
    this.sensor.labelstream = stream;
    this.dropdown.close();
  }

  add_stream(name: string) {
    console.debug('adding stream', name);
    let scheme = this.workspace.EMPTY_SCHEME(name);
    this.labelstreams[name] = new LabelStream(name, scheme);
    this.sensor.labelstream = name;
    this.popover.close();
    this.dropdown.close();
  }

  remove_stream(stream: string, event) {
    event.stopPropagation();
    this.remove.emit(stream);
    this.dropdown.close();
  }

  noop(event) {
    console.log('NOOP', event);
  }

  toggleAddMenu() { this.closeOtherMenus() }

  toggleEditMenu(stream, event) {
    event.stopPropagation();
    this.closeOtherMenus(stream);
    let menu = this.getMenu(stream);
    if (menu.isOpen()) menu.close();
    else menu.open({stream});
  }

  rename_stream(event) {
    let [stream, name] = event;
    let menu = this.getMenu(stream);
    menu.close();
    console.log(`Attempting to rename ${stream} to ${name}`, this.labelstreams);
    this.rename.emit([stream, name]);

    console.log('SENSOR?', this.sensor);
  }
  // #endregion

  // #region [Helper Methods]
  private getStream(stream: string) { return this.labelstreams[stream] }

  private getMenu(stream) {
    let idx = this.streams.indexOf(stream);
    return this.menus[idx];
  }

  private closeOtherMenus(stream?) {
    if (!stream) { return this.closeEditMenus() }
    let idx = this.streams.indexOf(stream);
    let others = this.menus.filter((d,i) => i !== idx);
    for (let menu of others) { menu.close(); }
    this.popover.close();
  }

  private closeEditMenus() {
    for (let menu of this.menus) { menu.close(); }
  }
  // #endregion
}
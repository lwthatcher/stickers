import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-edit-labelstream',
  templateUrl: './edit-labelstream-popover.component.html',
  styleUrls: ['./new-labelstream-popover.component.scss']
})
export class EditLabelstreamPopover implements OnInit {
  // #region [Inputs]
  @Input() stream: string;
  @Input() streams: string[];
  // #endregion

  // #region [Outputs]
  @Output() submit: EventEmitter<[string, string]> = new EventEmitter();
  // #endregion

  // #region [Constructors]
  constructor() { }
  ngOnInit() { }
  // #endregion

  // #region [Public Methods]
  validName(name: string): boolean {
    return !!name && name.length > 0 && !this.streams.includes(name);
  }

  create(name: string) {
    if (!this.validName(name)) { return }
    this.submit.emit([this.stream, name]);
  }
  // #endregion
}

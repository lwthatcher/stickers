import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-new-labelstream',
  templateUrl: './new-labelstream-popover.component.html',
  styleUrls: ['./new-labelstream-popover.component.scss']
})
export class NewLabelstreamPopover implements OnInit {
  // #region [Inputs]
  @Input() streams: string[];
  // #endregion

  // #region [Outputs]
  @Output() submit: EventEmitter<string> = new EventEmitter();
  // #endregion

  // #region [Constructors]
  constructor() { }
  ngOnInit() { }
  // #endregion

  // #region [Public Methods]
  validName(name: string): boolean { 
    return !!name && name.length > 0 && !this.streams.includes(name);
  }

  interrupt_submit(event) {
    console.debug("user pressed enter - interrupting auto-submit", event);
    event.stopPropagation();
    return false;
  }

  create(name: string) {
    if (!this.validName(name)) { return }
    this.submit.emit(name);
  }
  // #endregion
}

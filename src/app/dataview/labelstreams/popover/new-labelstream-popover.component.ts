import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-new-labelstream',
  templateUrl: './new-labelstream-popover.component.html',
  styleUrls: ['./new-labelstream-popover.component.scss']
})
export class NewLabelstreamPopoverComponent implements OnInit {
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
  valid_name(name: string): boolean { 
    return name.length > 0 && !(name in this.streams)
  }

  create(name: string) {
    if (!this.valid_name(name)) { return }
    this.submit.emit(name);
  }
  // #endregion
}

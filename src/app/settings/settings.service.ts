import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

export enum ColorScheme {
  Category10,
  Accent,
  Dark2,
  Paired,
  Pastel1,
  Pastel2
}

@Injectable()
export class SettingsService {
  // #region [Constructor]
  constructor(private http: HttpClient) { }
  // #endregion

  // #region [Private Properties]
  _spinner_options = {
    lines: 13, // The number of lines to draw
    length: 40, // The length of each line
    width: 20, // The line thickness
    radius: 45, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#636288', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '51%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    position: 'absolute' // Element positioning
  }
  // #endregion

  // #region [Properties]
  line_scheme = ColorScheme.Accent;
  label_scheme = ColorScheme.Paired;
  // #endregion

  // #region [Accessors]
  get spinner_options() { return this._spinner_options }
  // #endregion

  // #region [Public Methods]
  version(): Observable<string> {
    return this.http.get('/api/version', {responseType: 'text'});
  }
  // #endregion
}

import { Injectable } from '@angular/core';
import { SettingsService, ColorScheme } from '../settings/settings.service';
import * as d3 from "d3";

export interface ColorMap {
  (i:number): any
}

@Injectable()
export class ColorerService {

  constructor(private settings: SettingsService) { }

  get line_color() { return ColorerService.colorMap(this.settings.line_scheme) }

  get label_color() { return ColorerService.colorMap(this.settings.label_scheme) }

  static colorMap(scheme: ColorScheme): ColorMap {
    if (scheme === ColorScheme.Category10) return d3.scaleOrdinal(d3.schemeCategory10);
    if (scheme === ColorScheme.Accent) return d3.scaleOrdinal(d3.schemeAccent);
    if (scheme === ColorScheme.Dark2) return d3.scaleOrdinal(d3.schemeDark2);
    if (scheme === ColorScheme.Paired) return d3.scaleOrdinal(d3.schemePaired);
    if (scheme === ColorScheme.Pastel1) return d3.scaleOrdinal(d3.schemePastel1);
    if (scheme === ColorScheme.Pastel2) return d3.scaleOrdinal(d3.schemePastel2);
  }
}

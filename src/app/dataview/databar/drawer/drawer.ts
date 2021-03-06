import { DatabarComponent } from '../databar.component';
import { Label } from '../../labelstreams/labelstream';
import { arraysEqual } from '../../../util/util';
import { Selection } from './selection.interface';
import { time_format } from './time-format';
import { LayerMap } from './layers';
import { DisplayMode } from '../../energy/energy-wells';
import { HighlightBehavior } from './behaviors/highlight';
import { DragBehavior } from './behaviors/drag';
import { PourBehavior } from './behaviors/pour'
import { MouseBehavior } from './behaviors/mouse';
import { ZoomBehavior } from './behaviors/zoom';
import * as d3 from "d3";

export class Drawer {
  // #region [Variables]
  databar: DatabarComponent;
  layers: LayerMap;
  x; x0;
  xe; ye; ys;
  area; stacked_area;
  Y = [];
  lines = [];
  behaviors;
  // #endregion

  // #region [Constructor]
  constructor(databar: DatabarComponent) {
    this.databar = databar;
    // setup selection layers
    let host = d3.select(databar.element.nativeElement);
    this.layers = new LayerMap(host);
    this.layers.svg
        .attr('height', databar._height);
    this.layers.transform
        .attr("transform", "translate(" + databar.margin.left + "," + databar.margin.top + ")");
    this.layers.zoom
        .attr('width', databar.width)
        .attr('height', databar.height);
    this.layers.clip
        .attr('width', databar.width)
        .attr('height', databar.height);
    // setup behaviors
    this.behaviors = {};
    this.behaviors.highlight = new HighlightBehavior(this);
    this.behaviors.drag = new DragBehavior(this);
    this.behaviors.pour = new PourBehavior(this);
    this.behaviors.mouse = new MouseBehavior(this);
    this.behaviors.zoom = new ZoomBehavior(this);
    // register non-local behaviors
    this.layers.svg.call(this.behaviors.mouse.mouse);
    this.layers.svg.call(this.behaviors.zoom.zoom)
                   .on("dblclick.zoom", null);
  }
  // #endregion

  // #region [Accessors]
  get sensor() { return this.databar.sensor }

  get labels() { return this.databar.labels }

  get selected_label() { return this.databar.selected_label }

  get show_labels() { return this.databar.sensor.show_labels }

  get signals() { return this.layers.host.selectAll('g.signals > path.line') }

  get energyWells() { return this.layers.host.selectAll('g.energy > path.energy') }

  get w() { return this.databar.width }

  get h() { return this.databar.height }

  get mode() { return this.databar.mode }

  get labeller() { return this.databar.labeller }

  get label_type() { return this.ls.eventType }

  get ls() { return this.databar.labelstream }

  get isDomainSet() { return this.x && !arraysEqual(this.x.domain(), [0, 1]) }

  get energy() { return this.databar.energy }

  get video() { return this.databar.video }
  // #endregion

  // #region [Callbacks]
  get key() { return (d,i) => { return d ? d.id : i } }

  get width() { return (d) => { return this.x(d.end) - this.x(d.start) } }

  get middle() { return (d) => { return this.x(d.start + (d.end-d.start)/2) }  }

  get fill() { return (d) =>  { return this.databar.colorer.labels(this.ls.name).get(d.label) } }
  // #endregion

  // #region [Data Loading]
  async stackedSeries() {
    let formatted = await this.energy.formatted;
    let stack = d3.stack()
                  .keys(this.energy.short_dims)
                  .order(d3.stackOrderAscending);
    return stack(formatted);
  }
  // #endregion

  // #region [Public Plotting Methods]
  async draw() {
    this.set_ranges();
    let data = await this.databar._data;
    this.set_domains(data);
    this.energy_domains();
    this.databar.stop_spinner();
    this.draw_xAxis();
    this.draw_yAxis();
    this.draw_energy();
    this.plot_signals(data);
    this.draw_labels();
    this.draw_handles();
    this.draw_ctb();
  }
  
  draw_labels() {
    if (!this.labels) { return }
    if (!this.isDomainSet) { return }
    if (!this.show_labels) { this.clear('labels'); return; }
    
    let lbls = this.selectAllLabels();
    this.onExit(lbls);
    this.onEnter(lbls);
  }
  
  draw_handles(lbl?: Label) {
    // erase handles if show-labels is false
    if (!this.selected_label) { this.clear('handles'); return; }
    if (!this.show_labels) { this.clear('handles'); return; }
    // if no label is selected, clear the handles and return
    if (!lbl) { lbl = this.selected_label as Label }
    if (!lbl) { this.clear('handles'); return; }
    // selections
    let left = this.layers.handles.selectAll('rect.drag-handle.left').data([lbl]);
    let right = this.layers.handles.selectAll('rect.drag-handle.right').data([lbl]);
    let both = this.layers.handles.selectAll('rect.drag-handle');
    // draw left/right handles
    left = this._add_handle(left, 'left');
    right = this._add_handle(right, 'right');
    // conditionally format if width == 0
    if (lbl.start === lbl.end) { both.classed('warn', true) }
    else { both.classed('warn', false) }
  }
  
  clear(...layers) {
    // if no parameters given, clear everything
    if (layers.length === 0) {
      for (let p of this.layers.primaries) { p.all.remove() }
    }
    else for (let l of layers) {
      let layer = this.layers.get(l);
      layer.all.remove();
    }
  }
  
  draw_xAxis() {
    this.layers.axes.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + this.databar.height + ')')
        .call(d3.axisBottom(this.x)
                .tickFormat((d) => { return time_format(d) }));
  }

  draw_yAxis() {
    let W = this.w + (this.databar.margin.right *.25)
    this.layers.axes.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(this.Y[0]));
    if (this.yDims().length > 1) {
      this.layers.axes.append('g')
        .attr('class', 'y-axis')
        .attr("transform", "translate( " + W + ", 0 )")
        .call(d3.axisLeft(this.Y[1]));
    }
    if (this.energy.has_energy) {
      let y = this.eyAxis();
      this.layers.axes.append('g')
          .attr('class', 'y-axis')
          .attr("transform", "translate( " + W + ", 0 )")
          .call(d3.axisRight(y));
    }
  }

  draw_cursor(cursor) {
    this.clear('cursor');
    if (!cursor) { return }
    // only draws cursor
    let [x,y] = this.xy();
    let selection = this.layers.cursor;
    selection.append('svg')
             .attr('class', 'cursor')
             .attr('width', 24)
             .attr('height', 24)
             .attr('x', x-12)
             .attr('y', y-12)
             .attr('viewBox', "0 0 24 24")
             .append('path')
             .attr('d', cursor);
  }

  draw_ghost() {
    this.clear('ghost');
    if (!this.mode.click) { return }
    let [x,y] = this.xy();
    let [start,end] = this.labeller.bounds(x);
    let label = this.label_type;
    this.layers.ghost.append('rect')
        .datum({start, end, label})
        .attr('class', 'ghost-label')
        .attr('y', 0)
        .attr('height', this.databar.height)
        .attr('x', (d) => { return this.x(d.start) })
        .attr('width', this.width)
        .attr('fill', this.fill);
  }

  draw_ctb() {
    this.clear('timebar');
    if (!this.video.canPlay || !this.video.sync.canSync) { return; }
    let t = this.x(this.video.dt)
    this.layers.timebar.append('line')
        .attr('x1', t)
        .attr('x2', t)
        .attr('y1', 0)
        .attr('y2', this.h)
        .attr("clip-path", "url(#clip)")
        .attr('class', 'current-time-bar')
        .append('svg:title')
        .text('Current Time: ' + this.video.vt.toString())
  }

  async draw_energy() {
    if (!this.energy.has_energy) { return }
    if (!this.energy.visible) { this.clear('energy'); return; }
    if (this.energy.displayMode === DisplayMode.Stacked) {
      let series = await this.stackedSeries();
      this.plotStacked(series);
    }
    else if (this.energy.displayMode === DisplayMode.Overlayed) {
      let data = await this.energy.data;
      this.plotOverlayed(data);
    }
  }
  // #endregion

  // #region [Update Methods]
  updateSignals() {
    if (this.yDims().length === 1) {
      this.signals.attr("d", this.lines[0])
    }
    else for (let j of this.yDims()) {
      let dim_sigs = this.layers.host.selectAll('g.signals > path.line.line-' + j.toString());
      dim_sigs.attr("d", this.lines[j]);
    }
  }

  updateEnergy() {
    if (this.energy.displayMode === DisplayMode.Overlayed)
      this.energyWells.attr('d', this.area);
    else if (this.energy.displayMode === DisplayMode.Stacked)
      this.energyWells.attr('d', this.stacked_area);
  }

  updateLabels() {
    let width = (d) => { return this.x(d.end) - this.x(d.start) }
    this.layers.labels
        .selectAll('rect.label')
        .attr('x', (d) => { return this.x(d.start) })
        .attr('width', width)
  }

  updateLabel(label: Label) {
    let lbl = this.selectLabel(label)
                  .transition()
                  .duration(100)
                  .attr('x', (d) => { return this.x(d.start) })
                  .attr('width', this.width);
  }
  // #endregion

  // #region [Signal Plotting Helpers]
  private async plot_signals(_data) {
    // downsample first
    _data = await Promise.resolve(_data);
    let data = this.databar.downsample(_data);
    // draw each signal
    for (let j = 0; j < data.length; j++) {
      this.plot_signal(data[j], j);
    }
  }
  
  private plot_signal(signal, j) {
    this.layers.signals.append("path")
        .datum(signal)
        .attr("fill", "none")
        .attr("clip-path", "url(#clip)")
        .attr("class", "line line-" + j.toString())
        .attr("stroke", this.databar.colorer.lines.get(j+1))
        .attr("idx", j)
        .attr("d", this.getLine(j))
        .on("mouseover", () => this.behaviors.highlight.mouseover(j))
        .on("mouseout", () => this.behaviors.highlight.mouseout())
  }
  // #endregion
  
  // #region [Drag Handle Plotting Helpers]
  private _add_handle(selection: Selection, side: 'left' | 'right') {
    let callback;
    if (side === 'left') callback = (d) => { return this.x(d.start) - 5 }
    else callback = (d) => { return this.x(d.end) - 5 }
    return selection.enter().append('rect')
                    .attr('width', 10)
                    .classed('drag-handle', true)
                    .classed(side, true)
                    .attr('y', 0)
                    .attr('height', this.databar.height)
                    .call(this.behaviors.drag.resize[side])
                    .merge(selection)
                    .attr('x', callback)
  }
  // #endregion

  // #region [Labels Plotting Helpers]
  private selectAllLabels() {
    let rects = this.layers.labels
                    .selectAll('rect.label')
                    .data(this.labels, this.key)
                    .attr('x', (d) => { return this.x(d.start) })
                    .attr('width', this.width)
                    .attr('fill', this.fill)
                    .classed('selected', (d) => d.selected )
    return rects;
  }

  private selectLabel(lbl: Label) {
    return this.layers.labels.select('rect.label[lbl-id="' + lbl.id.toString() + '"]');
  }

  private onExit(lbls) {
    lbls.exit()
        .transition()
        .duration(250)
        .attr('width', 0)
        .attr('x', this.middle)
        .remove();
  }

  private onEnter(lbls) {
    let enter = lbls.enter()
                    .append('rect')
                    .attr('y', 0)
                    .attr('height', this.databar.height)
                    .attr('lbl-id', (d) => d.id)
                    .attr("clip-path", "url(#clip)")
                    .classed('label', true)
                    .on('click', (d) => { this.behaviors.mouse.lbl_clicked(d) })
                    .call(this.behaviors.drag.move)
                    .attr('x', this.middle)
                    .attr('width', 0)
                    .classed('selected', (d) => d.selected )
                    .attr('fill', this.fill)
    // add title pop-over
    enter.append('svg:title')
         .text((d) => {return d.type + ' event' || 'event ' + d.label.toString()})
    // transition
    enter.transition()
         .duration(250)
         .attr('x', (d) => { return this.x(d.start) })
         .attr('width', this.width)
    return enter;
  }
  // #endregion

  // #region [Energy Wells Plotting Helpers]
  private plotStacked(series) {
    // update selection
    let wells = this.layers.energy.selectAll('path').data(series)
    // exit selection
    wells.exit()
         .remove()
    // entering selection
    wells = wells.enter().append('path')
          .merge(wells)
          .attr('class', 'energy')
          .attr("clip-path", "url(#clip)")
          .attr('fill', (d,i) => this.databar.colorer.wells.get(i))
          .attr('d', this.stacked_area)
          .append('svg:title').text((d,i) => {return d.key})
  }

  private plotOverlayed(data) {
    console.debug('plotting overlayed', data);
    for (let j = 0; j < data.length; j++) {
      this.layers.energy.append('path')
                        .datum(data[j])
                        .attr('class', 'energy')
                        .attr('fill', this.databar.colorer.wells.get(j+1))
                        .attr("clip-path", "url(#clip)")
                        .attr('d', this.area);
    }
  }
  // #endregion

  // #region [Domains and Ranges]
  set_ranges() {
    // set x-ranges
    this.x = d3.scaleLinear().rangeRound([0, this.w]);
    this.x0 = d3.scaleLinear().rangeRound([0, this.w]);
    this.xe = d3.scaleLinear().rangeRound([0, this.w]);
    // set y-ranges
    for (let j of this.yDims()) {
      this.Y[j] = d3.scaleLinear().rangeRound([this.h, 0]);
    }
    this.ye = d3.scaleLog()
                .clamp(true)
                .rangeRound([0, this.h]);
    this.ys = d3.scaleLog()
                .clamp(true)
                .rangeRound([0, this.h]);
    // setup line-drawing method(s)
    for (let j of this.yDims()) {
      this.lines[j] = d3.line().x((d) => this.x(d.i))
                               .y((d) => this.Y[j](d.d))
    }
    // setup area-drawing method
    this.area = d3.area()
          .x((d) => this.xe(d.i))
          .y1((d) => this.ye(d.d+1));
    this.stacked_area = d3.area()
          .x((d) => this.xe(d.data.i))
          .y0((d) => this.ys(d[0]+1))
          .y1((d) => this.ys(d[1]+1));
  }

  set_domains(axes) {
    // setup x-domains
    let max = axes[0][axes[0].length-1].i;
    this.x.domain([0, max]);
    this.x0.domain(this.x.domain());
    // combined y-domains (default)
    if (this.yDims().length === 1) {
      this.Y[0].domain([d3.min(axes, (ax) => d3.min(ax, (d) => d.d)), 
                        d3.max(axes, (ax) => d3.max(ax, (d) => d.d))]);
    }
    // individual y-domains
    else for (let j of this.yDims()) {
      this.Y[j].domain([d3.min(axes[j], (d) => d.d), 
                        d3.max(axes[j], (d) => d.d)])
    }
  }

  async energy_domains() {
    if (!this.energy.has_energy) { return }
    // await data
    let axes = await this.energy.data;
    let series = await this.stackedSeries();
    // helper methods
    let imax = axes[0][axes[0].length-1].i;
    let seriesMax = (layer) => { return d3.max(layer, (d) => d[1]+1) };
    // set domains
    this.xe.domain([0, imax]);
    this.ye.domain([1, d3.max(axes, (ax) => d3.max(ax, (d) => d.d+1))]);
    this.ys.domain([1, d3.max(series, seriesMax)])

    this.area.y0(this.ye(0));
  }

  private yDims() {
    if (this.sensor.channel === 'B') return [0, 1];
    else return [0];
  }

  private getLine(j) {
    if (this.sensor.channel !== 'B') return this.lines[0];
    else return this.lines[j];
  }

  private eyAxis() {
    if (this.energy.displayMode === DisplayMode.Overlayed) return this.ye;
    else return this.ys;
  }
  // #endregion

  // #region [Utility Methods]
  xy(event?): number[] {
    if (event) return d3.clientPoint(this.layers.zoom.node(), event);
    else return d3.mouse(this.layers.zoom.node());
  }

  region() {
    // get x,y
    let [x,y] = this.xy();
    // return region based on precedence
    if (x < 0) return 'y-axis';
    if (y < 0) return 'margin-top';
    if (x > this.w) return 'margin-right';
    if (y > this.h) return 'x-axis';
    return 'frame';
  }

  /** alias method for drawer.behaviors.mouse.clicked() */
  clicked(event) { this.behaviors.mouse.clicked(event) }
  // #endregion

  // #region [Helper Methods]
  private domains_and_ranges() {
    let dr = (d) => {return [d.domain(), d.range()]}
    let ys = this.Y.map((y) => dr(y))
    return {x: dr(this.x), x0: dr(this.x0), Y: ys} 
  }

  logInfo() {
    console.groupCollapsed('drawer');
    console.log('domains/ranges', this.domains_and_ranges());
    console.log('layers:', this.layers);
    console.log('line(s):', this.lines);
    console.log('stacked series:', this.stackedSeries());
    console.log('behaviors:', this.behaviors);
    console.log('drawer:', this);
    console.groupEnd();
  }
  // #endregion
}

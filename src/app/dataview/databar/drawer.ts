import { DatabarComponent } from './databar.component';
import { Label } from './labeller';
import { Selection, SelectionTransition } from './selection';
import * as d3 from "d3";

export class Drawer {
  // #region [Constructor]
  databar: DatabarComponent;
  constructor(databar: DatabarComponent) { this.databar = databar }
  // #endregion

  // #region [Accessors]
  get labels() { return this.databar.labels }

  get selected_label() { return this.databar.selected_label }

  get show_labels() { return this.databar.labelstream && this.databar.labelstream.show }

  get x() { return this.databar.x }

  get y() { return this.databar.y }
  // #endregion

  // #region [Public Methods]
  async draw() {
    // set the respective ranges for x/y
    this.databar.set_ranges();
    // wait for data to load
    let data = await this.databar._data;
    // stop loading-spinner once the domains are updated
    this.databar.set_domains(data);
    this.databar.stop_spinner();
    // draw axes
    this.draw_xAxis();
    this.draw_yAxis();
    // draw each signal
    this.plot_signals(data);
    // draw labels
    if (this.labels) 
      this.draw_labels();
    // draw handles if label selected
    if (this.selected_label)
      this.draw_handles();
  }
  
  draw_labels() {
    // erase labels if show-labels is false
    if (!this.show_labels) { this.clear('labels'); return; }
    // helper functions
    let key = (d,i) => { return d ? d.id : i }
    let middle = (d) => { return this.x(d.start + (d.end-d.start)/2) }
    let width = (d) => { return this.x(d.end) - this.x(d.start) }
    // updated elements
    let rects = this.databar.g_lbls.selectAll('rect.label')
                    .data(this.labels, key)
                    .classed('updated', true)
                    .attr('x', (d) => { return this.x(d.start) })
                    .attr('width', width)
                    .attr('fill', (d) => { return this.databar.label_color(d.label) })
                    .classed('selected', (d) => d.selected )
    // exit (remove) elements
    rects.exit()
          .transition()
          .duration(250)
          .attr('width', 0)
          .attr('x', middle)
          .remove();
    // entering (new) elements
    let enter = rects.enter()
                      .append('rect')
                      .attr('y', 0)
                      .attr('height', this.databar.height)
                      .attr("clip-path", "url(#clip)")
                      .classed('label', true)
                      .on('click', (d) => { this.databar.lbl_clicked(d) }, false)
                      .call(d3.drag().on('drag', (...d) => { this.databar.lbl_dragged(d) }))
                      .attr('x', middle)
                      .attr('width', 0)
                      .classed('selected', (d) => d.selected )
                      .attr('fill', (d) => { return this.databar.label_color(d.label) })
    // add title pop-over
    enter.append('svg:title')
          .text((d) => {return d.type + ' event' || 'event ' + d.label.toString()})
    // transition for creation
    enter.transition()
          .duration(250)
          .attr('x', (d) => { return this.x(d.start) })
          .attr('width', width)
  }
  
  draw_handles(lbl?: Label) {
    // erase handles if show-labels is false
    if (!this.show_labels) { this.clear('handles'); return; }
    // if no label is selected, clear the handles and return
    if (!lbl) { lbl = this.selected_label as Label }
    if (!lbl) { this.clear('handles'); return; }
    // selections
    let left = this.databar.g_hand.selectAll('rect.drag-handle.left').data([lbl]);
    let right = this.databar.g_hand.selectAll('rect.drag-handle.right').data([lbl]);
    // draw left/right handles
    left = this._add_handle(left, 'left');
    right = this._add_handle(right, 'right');
    // conditionally format if width == 0
    if (lbl.start === lbl.end) {
      left.classed('warn', true);
      right.classed('warn', true);
    }
    else {
      left.classed('warn', false);
      right.classed('warn', false);
    }
  }
  
  clear(...layers) {
    // if no parameters given, clear everything
    if (layers.length === 0) {
      this.databar.g_sigs.selectAll("*").remove();
      this.databar.g_axes.selectAll("*").remove();
      this.databar.g_lbls.selectAll("*").remove();
      this.databar.g_hand.selectAll("*").remove();
      return;
    }
    // otherwise clear specified layers
    if (layers.includes('signals')) this.databar.g_sigs.selectAll("*").remove();
    if (layers.includes('axes')) this.databar.g_axes.selectAll("*").remove();
    if (layers.includes('labels')) this.databar.g_lbls.selectAll("*").remove();
    if (layers.includes('handles')) this.databar.g_hand.selectAll("*").remove();
    if (layers.includes('x-axis')) this.databar.g_axes.selectAll("g.x-axis").remove();
    if (layers.includes('y-axis')) this.databar.g_axes.selectAll("g.y-axis").remove();
  }
  
  draw_xAxis() {
    this.databar.g_axes.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + this.databar.height + ')')
        .call(d3.axisBottom(this.x));
  }

  draw_yAxis() {
    this.databar.g_axes.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(this.y));
  }
  // #endregion

  // #region [Helper Methods]
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
    this.databar.g_sigs.append("path")
        .datum(signal)
        .attr("fill", "none")
        .attr("clip-path", "url(#clip)")
        .attr("class", "line line-" + j.toString())
        .attr("stroke", this.databar.line_color(j))
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.7)
        .attr("d", this.databar.line);
  }
  
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
                    .call(d3.drag().on('drag', (d) => { this.databar.lbl_resize(d, side) }))
                    .merge(selection)
                    .attr('x', callback)
  }
  // #endregion
}
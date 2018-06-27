import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DataInfo } from './workspace-info';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";
import * as d3 from "d3";
import * as math from 'mathjs';
import { Sensor } from '../dataview/sensors/sensor';

export const MILLISECONDS = 1000

// #region [Interfaces]
interface datum {
  d: number;
  i: number;
}

interface SensorLike {
  idxs: number[];
}

type Axes = Array<Axis>
type Axis = tf.Tensor | number[]
type SignalStream = (Float32Array | Int32Array | Uint8Array | number[])[]
type RawData = ArrayBuffer | string;
// #endregion

// #region [Helper Classes]
export abstract class Dataset {
  // properties
  axes: Axes;
  info: DataInfo;
  // constructor
  constructor(info: DataInfo) { this.info = info }
  // abstract methods
  abstract format(): SignalStream;
  abstract filter(sensor: SensorLike): Dataset;
  // shared methods
  toDatum(): datum[][] { return this.format().map((axis) => this.toArray(axis)) }
  // protected methods
  protected toArray(axis): datum[] { return Array.from(axis).map((d,i) => this.convert(d,i)) }
  protected convert(d, _i) {
    let i = (_i * (MILLISECONDS / this.info.Hz) );
    return {d, i};
  }
}

class TensorDataset extends Dataset {
  axes: Array<tf.Tensor>;
  constructor(axes: Array<tf.Tensor>, info: DataInfo) {
    super(info);
    this.axes = axes;
  }
  format() { return this.axes.map((axis) => axis.dataSync()) }
  filter(sensor: SensorLike): Dataset {
    let idx = sensor.idxs;
    const newaxes = this.axes.filter((e,i) => idx.includes(i));
    return new TensorDataset(newaxes, this.info);
  }
}

class CSVDataset extends Dataset {
  axes: number[][];
  constructor(axes: number[][], info: DataInfo, transpose = true) {
    super(info);
    if (transpose) this.axes = math.transpose(axes); 
    else this.axes = axes;
  }
  format() { return this.axes }
  filter(sensor: SensorLike): Dataset {
    let idx = sensor.idxs;
    const newaxes = this.axes.filter((e,i) => idx.includes(i));
    return new CSVDataset(newaxes, this.info, false);
  }
}
// #endregion


@Injectable()
export class DataloaderService {

  // #region [Constructors]
  private datasets: Map<String,Promise<Dataset>>;
  constructor(private http: HttpClient) { 
    this.datasets = new Map();
  }
  // #endregion

  // #region [Public Methods]
  loadDataset(data: DataInfo) {
    let uri = '/api/data/' + data.workspace + '/' + data.name;
    let options = this.getOptions(data.format);
    let result = this.http.get(uri, options).toPromise()
                     .then((d: RawData) => { return this.toDataset(d, data) });
    this.datasets.set(data.name, result);
    console.debug('LOADING DATASET', result, data, this);
    return this.datasets.get(data.name);
  }

  getSensorStreams(dataset: string, sensor: Sensor): Promise<Dataset> {
    console.debug('retrieving data', dataset, sensor, this);
    return this.datasets.get(dataset)
                        .then((dataset) => dataset.filter(sensor))
  }

  getLabels(dataset: string) {
    return this.datasets.get(dataset)
                        .then((ds) => ds.filter({idxs: [ds.axes.length-1]}))
                        .then((ds) => ds.toDatum()[0])
  }
  // #endregion

  // #region [Helper Methods]
  private toDataset(d: RawData, info: DataInfo): Dataset {
    let format = info.format;
    if (format === 'tensor') {
      let tensors = parse(d as ArrayBuffer);
      let axes = tf.split(tensors, tensors.shape[1], 1);
      return new TensorDataset(axes, info);
    }
    else if (format === 'csv') {
      let asNumber = (d: Array<string>) => { return d.map((di) => +di) };
      let axes = d3.csvParseRows(d, asNumber);
      return new CSVDataset(axes, info);
    }
    else throw new TypeError('unrecognized or unsupported format type: ' + format);
  }

  private getOptions(format: string): any {
    if (format === 'tensor') return { responseType: 'arraybuffer' }
    else if (format === 'csv') return { responseType: 'text' }
    else throw new TypeError('unrecognized or unsupported format type: ' + format);
  }
  // #endregion
}

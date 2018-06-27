import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DataInfo } from './workspace-info';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";
import * as d3 from "d3";
import * as math from 'mathjs';
import { Sensor } from '../dataview/sensors/sensor';
import { Dataset, TensorDataset, CSVDataset } from './dataset';

export const MILLISECONDS = 1000

// #region [Interfaces]
interface datum {
  d: number;
  i: number;
}

interface SensorLike {
  idxs: number[];
}

type RawData = ArrayBuffer | string;
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
  private toDataset(data: RawData, info: DataInfo): Dataset {
    let format = info.format;
    if (format === 'tensor') {
      let tensors = parse(data as ArrayBuffer);
      let axes = tf.split(tensors, tensors.shape[1], 1);
      return new TensorDataset(axes, info);
    }
    else if (format === 'csv') {
      let asNumber = (d: Array<string>) => { return d.map((di) => +di) };
      let axes = d3.csvParseRows(data, asNumber);
      return new CSVDataset(axes, info);
    }
    else if (format === 'bdl') {
      let rows = d3.csvParseRows(data, (d) => { return this.bdlrow(d) });
      let axes = d3.nest()
                   .key((d) => { return d.token })
                   .object(rows);
      
    }
    else throw new TypeError('unrecognized or unsupported format type: ' + format);
  }

  private getOptions(format: string): any {
    if (format === 'tensor') return { responseType: 'arraybuffer' }
    else if (format === 'csv') return { responseType: 'text' }
    else throw new TypeError('unrecognized or unsupported format type: ' + format);
  }

  private bdlrow(d) {
    let [token, t, ...data] = d;
    // skip empty/non-data lines
    if (!token || token === 'D' || token === 'S') return undefined;
    // format as numbers
    t = +t;
    data = data.map((d) => +d);
    return {token, t, data}
  }
  // #endregion
}

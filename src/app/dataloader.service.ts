import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";

// #region [Interfaces]
export interface Dataset {
  axes: Axes;
  format(): SignalStream;
  filter(idx: number[]): Dataset;
}
type Axes = Array<Axis>
type Axis = tf.Tensor | number[]
export type SignalStream = (Float32Array | Int32Array | Uint8Array | number[])[]
// #endregion

// #region [Helper Classes]
class TensorDataset implements Dataset {
  axes: Array<tf.Tensor>;
  constructor(axes: Array<tf.Tensor>) { this.axes = axes; }
  format() {
    return this.axes.map((axis) => axis.dataSync())
  }
  filter(idx: number[]): Dataset {
    const newaxes = this.axes.filter((e,i) => idx.includes(i));
    return new TensorDataset(newaxes);
  }
}

class CsvDataset implements Dataset {
  axes: number[][]
  constructor(axes: number[][]) { this.axes = axes; }
  format() { return this.axes; }
  filter(idx: number[]): Dataset {
    const newaxes = this.axes.filter((e,i) => idx.includes(i));
    return new CsvDataset(newaxes);
  }
}
// #endregion

// #region [Service]
@Injectable()
export class DataloaderService {
  private datasets: Map<String,Promise<Dataset>>;

  constructor(private http: HttpClient) { 
    this.datasets = new Map();
  }

  setDataset(dataset: string) {
    const val = this.fetchTensors(dataset);
    this.datasets.set(dataset, val);
    console.debug('added dataset', dataset, this.datasets);
  }

  getData(dataset: string, idx: number[]): Promise<Dataset> {
    console.debug('retrieving data', dataset, idx, this);
    return this.datasets.get(dataset)
                        .then((dataset) => {console.debug('datset type', typeof dataset); return dataset;})
                        .then((dataset) => dataset.filter(idx))
  }

  private fetchTensors(dataset: string): Promise<TensorDataset> {
    return this.http.get('/api/data/tensors/' + dataset, {responseType: 'arraybuffer'})
                .toPromise()
                .then((b) => parse(b))
                .then(t => {return tf.split(t, t.shape[1], 1)})
                .then((axes) => {return new TensorDataset(axes)})
  }
  // #endregion
}

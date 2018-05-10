import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";

export type Axes = Array<Axis>
type Axis = tf.Tensor | number[]

@Injectable()
export class DataloaderService {
  private datasets: Map<String,Promise<Axes>>;

  constructor(private http: HttpClient) { 
    this.datasets = new Map();
  }

  setDataset(dataset: string) {
    const val = this.fetchTensors(dataset);
    this.datasets.set(dataset, val);
    console.debug('added dataset', dataset, this.datasets);
  }

  getData(dataset: string, idx: Array<number>): Promise<Axes> {
    console.debug('retrieving data', dataset, idx, this);
    let promise = this.datasets.get(dataset);
    console.debug('dataset promise', promise);
    return promise.then((ts) => {console.debug('parsing tensors', ts); return ts;})
                  .then((ts) => {return ts.filter((e,i) => idx.includes(i))})
  }

  private fetchTensors(dataset: string): Promise<Array<tf.Tensor>> {
    return this.http.get('/api/data/tensors/' + dataset, {responseType: 'arraybuffer'})
                .toPromise()
                .then((b) => parse(b))
                .then(t => {return tf.split(t, t.shape[1], 1)})
  }

}

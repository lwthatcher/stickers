import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";

@Injectable()
export class DataloaderService {
  constructor(private http: HttpClient) { }


  tensorStreams(): Promise<Array<tf.Tensor>> {
    console.log('getting tensor streams');
    return this.http.get('/api/data', {responseType: 'arraybuffer'})
                .toPromise()
                .then((b) => parse(b))
                .then(t => {return tf.split(t, t.shape[1], 1)})
  }

  getData(idx: Array<number>): Promise<Array<tf.Tensor>> {
    console.log('calling get data!');
    return this.tensorStreams()
                .then((ts) => {return ts.filter((e,i) => idx.includes(i))})
  }

}

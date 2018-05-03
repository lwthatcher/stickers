import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { parse } from "tfjs-npy";
import * as tf from "@tensorflow/tfjs-core";

@Injectable()
export class DataloaderService {
  constructor(private http: HttpClient) { }



  getData(): Promise<tf.Tensor> {
    console.log('calling get data!');
    return this.http.get('/api/data', {responseType: 'arraybuffer'})
                .toPromise()
                .then((b) => {console.log('buffered-data', b); return b;})
                .then((b) => {return parse(b)})
  }

}

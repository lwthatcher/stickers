import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import * as tf from "@tensorflow/tfjs-core";

@Injectable()
export class DataloaderService {

  constructor(private http: HttpClient) { }

  getData(): Observable<tf.Tensor> {
    const result = this.http.get<tf.Tensor>('/api/data');
    console.log('getting data', result);
    return result;
  }

}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import * as tf from "@tensorflow/tfjs-core";

@Injectable()
export class DataloaderService {

  constructor(private http: HttpClient) { }



  getData() {
    const b = this.http.get('/api/data', {responseType: 'arraybuffer'});
    console.log('array-buffer data', b);
    return b;
  }

}

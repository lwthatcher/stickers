import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DataloaderService {

  constructor(private http: HttpClient) { }

  getData() {
    const result = this.http.get('/api/data');
    console.log('getting data', result);
    return result;
  }

}

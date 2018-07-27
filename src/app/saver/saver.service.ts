import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SaverService {

  constructor(private http: HttpClient) { }

  saveFlashes() {}

  saveLabels() {}
}

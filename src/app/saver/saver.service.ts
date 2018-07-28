import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SaverService {

  constructor(private http: HttpClient) { }

  saveFlashes(flashes) {
    return this.http.post("/api/save/flashes", flashes, { responseType: 'text' });
  }

  saveLabels(stuff) {
    return this.http.post("/api/save/labels", stuff);
  }

  computeEnergy(stuff) {
    return this.http.post("/api/compute/energy", stuff);
  }
}

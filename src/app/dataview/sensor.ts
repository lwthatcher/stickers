

export class Sensor {
    id: number;
  name: string;
  dims: string[];
  idxs: number[];
  hide: boolean;
  labelstream: string;
  channel?: string;

  constructor(id, name, dims, idxs, hide, ls, channel) {
    this.id = id;
    this.name = name;
    this.dims = dims;
    this.idxs = idxs;
    this.hide = hide;
    this.labelstream = ls;
    this.channel = channel;
  }
}
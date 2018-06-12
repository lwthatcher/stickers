import { EventEmitter } from '@angular/core';

// #region [Interfaces]
type IdxEntries = [number, number[]][]
type IndexMap = Map<number,number[]>
// #endregion

export class Sensor {
    // #region [Static Properties]
    static SENSOR_DIMS = {
        'A': ['x', 'y', 'z'],
        'G': ['x', 'y', 'z'],
        'C': ['x', 'y', 'z'],
        'L': ['both', 'infrared'],
        'B': ['altitude', 'temperature']
      }

    static SENSOR_NAMES = {
        'A': 'Accelerometer',
        'G': 'Gyroscope',
        'C': 'Compass',
        'L': 'Light',
        'B': 'Barometer'
    }
    // #endregion

    // #region [Properties]
    id: number;
    name: string;
    dims: string[];
    idxs: number[];
    hidden: boolean;
    channel: string;
    labelstream: string;
    event: EventEmitter<string>;
    private idxmap: IndexMap;
    // #endregion

    // #region [Constructor]
    constructor(channel: string, id: number, ls: string, idxmap: IndexMap) {
        this.channel = channel;
        this.id = id;
        this.idxmap = idxmap;
        this.name = Sensor.SENSOR_NAMES[channel];
        this.dims = Sensor.SENSOR_DIMS[channel];
        this.idxs = idxmap.get(id);
        this.labelstream = ls;
        this.hidden = false;
    }
    // #endregion

    // #region [Public Methods]
    update(info) {
        let {name, channel, index} = info;
        this.name = name;
        this.channel = channel;
        this.dims = Sensor.SENSOR_DIMS[channel];
        this.idxs = this.idxmap[index];
        console.debug('updated sensor:', this.id, this);
    }

    hide() { this.hidden = true }

    show() { this.hidden = false }
    // #endregion

    // #region [Static Methods]
    static gen_idx_map(channels: string): IndexMap {
        // some helper closures
        let len = (c) => Sensor.SENSOR_DIMS[c].length  // map -> # of sensors for given channel
        let sum = (acc, cur) => acc + cur             // reduce -> sum over array
        let getIdxs = (c,i,arr) => { 
            let so_far = arr.slice(0,i).map(len).reduce(sum, 0);
            let idx = Sensor.SENSOR_DIMS[c].map((_,i) => so_far+i);
            return [i, idx]
        }
        // apply map to get entries
        let entries = [...channels].map(getIdxs) as IdxEntries
        // convert entries to Map
        return new Map<number,number[]>(entries);
    }
    // #endregion
}
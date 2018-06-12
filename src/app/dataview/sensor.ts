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
    _index: number;
    hidden: boolean;
    channel: string;
    show_labels: boolean;
    labelstream: string;
    event: EventEmitter<string>;
    private idxmap: IndexMap;
    // #endregion

    // #region [Constructor]
    constructor(channel: string, id: number, ls: string, idxmap: IndexMap) {
        // passed-in values
        this.channel = channel;
        this.id = id;
        this._index = id;
        this.idxmap = idxmap;
        this.labelstream = ls;
        // derived values
        this.name = Sensor.SENSOR_NAMES[channel];
        this.dims = Sensor.SENSOR_DIMS[channel];
        this.idxs = idxmap.get(id);
        // default values
        this.hidden = false;
        this.show_labels = true;
        // setup event-emitter
        this.event = new EventEmitter<string>();
    }
    // #endregion

    // #region [Public Methods]
    update(info) {
        let {name, channel, index} = info;
        this.name = name;
        this.channel = channel;
        this._index = index;
        this.dims = Sensor.SENSOR_DIMS[channel];
        this.idxs = this.idxmap.get(index);
        console.debug('updated sensor:', this.id, this);
        this.event.emit('redraw');
    }

    hide() { this.hidden = true }

    show() { this.hidden = false }

    toggle_labels() { this.show_labels = !this.show_labels }
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
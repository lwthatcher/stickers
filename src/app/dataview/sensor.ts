

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
    hide: boolean;
    labelstream: string;
    channel?: string;
    // #endregion

    // #region [Constructor]
    constructor(channel, id, ls, idxmap) {
        this.channel = channel;
        this.id = id;
        this.name = Sensor.SENSOR_NAMES[channel];
        this.dims = Sensor.SENSOR_DIMS[channel];
        this.idxs = idxmap.get(id);
        this.labelstream = ls;
        this.hide = false;
    }
    // #endregion
}
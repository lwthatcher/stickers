import { DataInfo } from "./workspace-info";
import * as tf from "@tensorflow/tfjs-core";
import * as math from 'mathjs';


// #region [Interfaces]
interface datum {
    d: number;
    i: number;
  }
  
interface SensorLike {
channel?: string;
idxs: number[];
}

interface ReadingsMap {
    [channel: string]: bdldatum[]
}

interface bdldatum {
    token: string;
    t: number;
    data: number[];
}
  
type Axes = Array<Axis>
type Axis = tf.Tensor | number[] | bdldatum
type SignalStream = (Float32Array | Int32Array | Uint8Array | number[])[]
  // #endregion

export abstract class Dataset {
    // #region [Constructor]
    axes?: Axes;
    map?: ReadingsMap;
    info: DataInfo;
    constructor(info: DataInfo) { this.info = info }
    // #endregion
    
    // #region [Public Methods]
    get(sensor: SensorLike) { return this.format(this.filter(sensor)).map((axis) => this.toArray(axis)) }
    // #endregion

    // #region [Helper Methods]
    protected abstract format(axes): SignalStream;

    protected toArray(axis): datum[] { return Array.from(axis).map((d,i) => this.convert(d,i)) }

    protected filter(sensor: SensorLike): Axes { return this.axes.filter((e,i) => sensor.idxs.includes(i)) }

    protected convert(d, _i) {
        let i = (_i * this.info.rate );
        return {d, i};
    }
    // #endregion
}

// #region [Helper Classes]
export class TensorDataset extends Dataset {
    axes: Array<tf.Tensor>;
    constructor(axes: Array<tf.Tensor>, info: DataInfo) {
        super(info);
        this.axes = axes;
    }
    protected format(axes: tf.Tensor[]) { return axes.map((axis) => axis.dataSync()) }
}
  
export class CSVDataset extends Dataset {
    axes: number[][];
    constructor(axes: number[][], info: DataInfo) {
        super(info);
        this.axes = math.transpose(axes);
    }
    protected format(axes): SignalStream { return axes as SignalStream }
}
// #endregion

export class BDLDataset extends Dataset {
    // #region [Constructor]
    map: ReadingsMap;
    constructor(map: ReadingsMap, info: DataInfo) {
        super(info);
        this.map = map;
    }
    // #endregion

    // #region [Implementation]
    get(sensor: SensorLike): datum[][] {
        return this.format(this.filter(sensor))
    }

    format(dims: bdldatum[]): SignalStream {
        let toDatum = (bdl: bdldatum) => {
            let data = bdl.data;
            return data.map((d) => { return this.convert(d, bdl.t) })
        }
    }

    filter(sensor: SensorLike): bdldatum[] { return this.map[sensor.channel] }
    // #endregion
}
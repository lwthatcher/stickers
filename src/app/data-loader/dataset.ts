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

interface bdldatum {
    token: string;
    t: number;
    data: number[];
}
  
type Axes = Array<Axis>
type Axis = tf.Tensor | number[]
type SignalStream = (Float32Array | Int32Array | Uint8Array | number[])[]
  // #endregion

export abstract class Dataset {
    // #region [Constructor]
    axes: Axes;
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
    constructor(axes: number[][], info: DataInfo, transpose = true) {
        super(info);
        if (transpose) this.axes = math.transpose(axes); 
        else this.axes = axes;
    }
    protected format(axes): SignalStream { return axes as SignalStream }
}
// #endregion

export class BDLDataset extends Dataset {
    // #region [Constructor]
    constructor(axes, info: DataInfo) {
        super(info);
    }
    // #endregion

    // #region [Implementation]
    format(): (Float32Array | Int32Array | Uint8Array | number[])[] {
        throw new Error("Method not implemented.");
    }
    // #endregion
}
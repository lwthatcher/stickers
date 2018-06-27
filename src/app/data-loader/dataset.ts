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
    // #region [Properties]
    axes: Axes;
    info: DataInfo;
    // #endregion
    
    // #region [Constructor]
    constructor(info: DataInfo) { this.info = info }
    // #endregion
    
    // #region [Abstract Methods]
    abstract filter(sensor: SensorLike): Dataset;
    abstract get formatted(): SignalStream;
    // #endregion
    
    // #region [Public Methods]
    toDatum(): datum[][] { return this.formatted.map((axis) => this.toArray(axis)) }
    // #endregion

    // #region [Protected Methods]
    protected toArray(axis): datum[] { return Array.from(axis).map((d,i) => this.convert(d,i)) }
    protected convert(d, _i) {
        let i = (_i * this.info.rate );
        return {d, i};
    }
    // #endregion
}

export class TensorDataset extends Dataset {
    // #region [Constructor]
    axes: Array<tf.Tensor>;
    constructor(axes: Array<tf.Tensor>, info: DataInfo) {
        super(info);
        this.axes = axes;
    }
    // #endregion

    // #region [Implementation]
    get formatted() { return this.axes.map((axis) => axis.dataSync()) }

    filter(sensor: SensorLike): Dataset {
        let idx = sensor.idxs;
        const newaxes = this.axes.filter((e,i) => idx.includes(i));
        return new TensorDataset(newaxes, this.info);
    }
    // #endregion
}
  
export class CSVDataset extends Dataset {
    // #region [Constructor]
    axes: number[][];
    constructor(axes: number[][], info: DataInfo, transpose = true) {
        super(info);
        if (transpose) this.axes = math.transpose(axes); 
        else this.axes = axes;
    }
    // #endregion

    // #region [Implementation]
    get formatted() { return this.axes }

    filter(sensor: SensorLike): Dataset {
        let idx = sensor.idxs;
        const newaxes = this.axes.filter((e,i) => idx.includes(i));
        return new CSVDataset(newaxes, this.info, false);
    }
    // #endregion
}

export class BDLDataset extends Dataset {
    // #region [Constructor]
    constructor(axes, info: DataInfo) {
        super(info);
    }
    // #endregion

    // #region [Implementation]
    filter(sensor: SensorLike): Dataset {
        throw new Error("Method not implemented.");
    }
    formatted: (Float32Array | Int32Array | Uint8Array | number[])[];
    // #endregion
}
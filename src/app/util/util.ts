/**
 * Similar to python's built-in zip() function,
 * but allows for arrays A,B to be of different length.
 * Missing indicies (due to different lengths) will be set as undefined.
 */
export function zip(A: Array<any>, B: Array<any>): Array<[any,any]> {
    let reverse = false;
    if (B.length > A.length) { [A, B] = [B, A]; reverse = true; }
    let result = A.map((a,i) => [a, B[i]]);
    if (!reverse) return result as [any,any][];
    else return result.map((pair) => {let [b,a] = pair; return [a,b]; }) as [any,any][];
}

/**
 * Inverts the keys and values in an object.
 */
export function invert(map: object): object {
    let result = {};
    for (let key in map) { result[map[key]] = key }
    return result;
}
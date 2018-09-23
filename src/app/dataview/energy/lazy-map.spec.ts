import { LazyMap } from './lazy-map';

class MockMapHolder {
    firstmap;
    secondmap;
    private ds: Promise<any>;
    constructor(ds) {
        this.ds = ds;
        this.firstmap = new LazyMap(() => this.first(this.ds));
        this.secondmap = new LazyMap(() => this.second(this.ds));
    }
    update(ds) { this.ds = ds; }
    first(ds) { return ds.then(d => d[0]) }
    second(ds) { return ds.then(d => d[1]) }
}

describe('LazyMap', () => {

    let A = Promise.resolve('blue');
    let B = Promise.resolve('red');
    let C = Promise.resolve([10, 20, 30, 40, 50]);
    let D = Promise.resolve({red: "warm", blue: "cool", yellow: "gross"})
    
    beforeEach(() => {});
   
    it('get -- handles promises', () => {
        const m = new MockMapHolder(A);
        let a = m.firstmap.get('a');
        a.then(answer => { expect(answer).toBe('b') })
    });

});
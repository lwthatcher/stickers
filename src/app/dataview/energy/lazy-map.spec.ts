import { LazyMap } from './lazy-map';

// #region [Constants]
const COLORS = {
    r: Promise.resolve('red'),
    g: Promise.resolve('green'),
    b: Promise.resolve('blue')
}
// #endregion

// #region [Helper Classes]
class MockMapHolder {
    firstmap;
    secondmap;
    private ds: Promise<any>;
    private i = 0;
    constructor(color) {
        this.ds = Promise.resolve(color);
        this.firstmap = new LazyMap(() => this.first(this.ds));
        this.secondmap = new LazyMap(() => this.second(this.ds));
    }
    update(color) { this.ds = Promise.resolve(color); }
    first(ds) { return ds.then(d => d[0]) }
    second(ds) { return ds.then(d => d[1]) }
    increment(ds) { this.i += 1; return Promise.resolve({d: ds, i: this.i}) }
}
// #endregion

describe('LazyMap', () => {

    const COLORS = {
        r: 'red',
        g: 'green',
        b: 'blue'
    }
    
    beforeEach(() => {});
   
    it('get -- handles promises', () => {
        let l = 'R';
        const m = new MockMapHolder(COLORS[l]);
        let [w1, w2] = [m.firstmap.get(l), m.secondmap.get(l)]
        w1.then(answer => { expect(answer).toBe('r') })
        w2.then(answer => { expect(answer).toBe('e') })
    });

    it('get -- callback pointing to changing object', () => {
        let l = 'R';
        const m = new MockMapHolder(COLORS[l]);
        let [w1, w2] = [m.firstmap.get(l), m.secondmap.get(l)]
        w1.then(answer => { expect(answer).toBe('r') })
        w2.then(answer => { expect(answer).toBe('e') })
        l = 'B';
        m.update(COLORS[l]);
        [w1, w2] = [m.firstmap.get(l), m.secondmap.get(l)]
        w1.then(answer => { expect(answer).toBe('b') })
        w2.then(answer => { expect(answer).toBe('l') })
        l = 'R';
        m.update(COLORS[l]);
        [w1, w2] = [m.firstmap.get(l), m.secondmap.get(l)]
        w1.then(answer => { expect(answer).toBe('r') })
        w2.then(answer => { expect(answer).toBe('e') })
    });

});
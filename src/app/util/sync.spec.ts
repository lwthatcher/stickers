import { Synchronizer } from './sync';


// Straight Jasmine testing without Angular's testing support
describe('Synchronizer', () => {
    
    beforeEach(() => { });
   
    it('canSync = false -- (data empty)', () => {
        let [dt, vt] = [[], [4.28888]]
        let sync = new Synchronizer(dt, vt);
        expect(sync.canSync).toBe(false);
    });

    it('canSync = false -- (video empty)', () => {
        let [dt, vt] = [[0, 669470], []]
        let sync = new Synchronizer(dt, vt);
        expect(sync.canSync).toBe(false);
    });

    it('canSync = false -- (both empty)', () => {
        let [dt, vt] = [[], []]
        let sync = new Synchronizer(dt, vt);
        expect(sync.canSync).toBe(false);
    });

    it('canSync = false -- (mismatch)', () => {
        let [dt, vt] = [[null, 1000], [1]]
        let sync = new Synchronizer(dt, vt);
        expect(sync.canSync).toBe(false);
    });

    it('canSync = true -- (same size)', () => {
        let [dt, vt] = [[0], [4.28888]]
        let sync = new Synchronizer(dt, vt);
        expect(sync.canSync).toBe(true);
    });

    it('canSync = false -- (different sizes)', () => {
        let [dt, vt] = [[0, 669470], [4.28888]]
        let sync = new Synchronizer(dt, vt);
        expect(sync.canSync).toBe(true);
    });

    it('video -> data', () => {
        let [dt, vt] = [[0, 623390], [11.89045]]
        let sync = new Synchronizer(dt, vt);
        expect(sync.vidToData(11.89045)).toBeCloseTo(0);
    })

    it('data -> video', () => {
        let [dt, vt] = [[0, 623390], [11.89045]]
        let sync = new Synchronizer(dt, vt);
        expect(sync.dataToVid(0)).toBeCloseTo(11.89045);
    })
});
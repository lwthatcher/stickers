import { Drawer } from "../drawer";
import * as d3 from "d3";

export class PourBehavior {
    // #region [Constants]
    ALPHA_DECAY = 0.001;
    PARTICLE_RADIUS = 2;
    COLLIDE_RADIUS = 5;
    DX = 10;
    TICK = 100;
    // #endregion
    
    // #region [Properties]
    drawer: Drawer;
    particles;
    simulation;
    private pour_timer;
    private current_lbl;
    // #endregion

    // #region [Constructor]
    constructor(drawer: Drawer) {
        this.drawer = drawer;
        this.particles = [];
    }
    // #endregion

    // #region [Accessors]
    get energy() { return this.drawer.energy }
    
    get label_type() { return this.drawer.label_type}

    get x() { return this.drawer.x }

    get color() { return this.drawer.databar.colorer.labels(this.drawer.ls.name).get(this.label_type)}
    // #endregion

    // #region [Callbacks]
    get xi() { return (x) => this.x.invert(x); }

    yDepth(formatted) {
        let e = (x) => {return this.energy.atSycn(this.xi(x), formatted)}
        return (x) => { return this.drawer.ys(e(x)) }
    }

    roll(ys) {
        return (x) => {
            let x0 = ys(x);
            let x1 = ys(x+this.DX);
            let x2 = ys(x-this.DX);
            let left = (x0-x2)/(this.DX*2)
            let right = (x0-x1)/(this.DX*2)
            return x+left-right;
        }
    }
    // #endregion

    // #region [Public Methods]
    async start() {
        if (!this.energy.has_energy) return;
        let [x,y] = this.drawer.xy();
        this.pour_timer = d3.interval((t) => this.pour_tick(x), this.TICK);
        let formatted = await this.energy.formatted;
        let ys = this.yDepth(formatted);
        let roll = this.roll(ys);
        this.current_lbl = this.drawer.labeller.add(x, this.label_type, 1);
        this.simulation = this.createSimulation(ys, roll);
    }
    
    end() {
        if (this.pour_timer) this.pour_timer.stop();
        if (this.simulation) this.simulation.stop();
        this.current_lbl = undefined;
        this.clearParticles();
    }
    // #endregion
    
    // #region [Helper Methods]
    private pour_tick(x) {
        // add particle
        let point = {x, y: 0}
        let nodes = this.simulation.nodes();
        nodes.push(point);
        // update simulation
        this.simulation.nodes(nodes);
        this.simulation.restart();
        // update label
        let [start, end] = this.extents();
        this.current_lbl = this.drawer.labeller.grow(this.current_lbl, start, end);
        console.debug('pour', this.current_lbl);
    }

    private ticked() {
        let u = this.drawer.layers.ghost.selectAll('circle').data(this.particles);
        u.enter()
            .append('circle')
            .attr('r', this.PARTICLE_RADIUS)
            .attr('fill', this.color)
            .attr('opacity', .9)
            .merge(u)
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y);
    }

    private createSimulation(ys, roll) {
        return d3.forceSimulation(this.particles)
                 .force('collide', d3.forceCollide(this.COLLIDE_RADIUS))
                 .force('fall', d3.forceY((d) => {return ys(d.x) }))
                 .force('roll', d3.forceX((d) => {return roll(d.x) }))
                 .alphaDecay(this.ALPHA_DECAY)
                 .on('tick', () => this.ticked());
    }

    private clearParticles() {
        
        this.drawer.layers.ghost
            .selectAll('circle')
            .transition()
            .duration(750)
            .attr('opacity', 0)
            .remove();
        this.particles = [];
    }

    private extents() {
        return d3.extent(this.particles, (d) => d.x);
    }
    // #endregion
}
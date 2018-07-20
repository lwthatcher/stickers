import { Drawer } from "../drawer";
import * as d3 from "d3";

export class PourBehavior {
    
    // #region [Properties]
    drawer: Drawer;
    particles = [];
    simulation;
    private pour_timer;
    // #endregion

    // #region [Constructor]
    constructor(drawer: Drawer) {
        this.drawer = drawer;
    }
    // #endregion

    // #region [Accessors]
    get energy() { return this.drawer.energy }
    
    get label_type() { return this.drawer.label_type}

    get x() { return this.drawer.x }
    // #endregion

    // #region [Public Methods]
    async start() {
        if (!this.energy.has_energy) return;
        let [x,y] = this.drawer.xy();
        this.pour_timer = d3.interval((t) => this.pour_tick(t, x), 100);
        let xt = (x) => this.x.invert(x);
        let formatted = await this.energy.formatted;
        let e = (x) => {return this.energy.atSycn(xt(x), formatted)}
        let ys = (x) => {return this.drawer.ys(e(x)) }
        const DX = 10;
        let roll = (x) => {
          let x0 = ys(x);
          let x1 = ys(x+DX);
          let x2 = ys(x-DX);
          let left = (x0-x2)/(DX*2)
          let right = (x0-x1)/(DX*2)
          return x+left-right;
        }
    
        let _label = this.label_type;
        let lbl = this.drawer.labeller.add(this.x(x), _label, 1);
    
        console.log('POURING', [x,y], ys(x), _label, lbl);
        this.simulation = d3.forceSimulation(this.particles)
            .force('collide', d3.forceCollide(5))
            .force('fall', d3.forceY((d) => {return ys(d.x) }))
            .force('roll', d3.forceX((d) => {return roll(d.x) }))
            .alphaDecay(0.001)
            .on('tick', () => this.ticked());
        
    }
    
    end() {
        console.log('END POUR')
        if (this.pour_timer)
            this.pour_timer.stop();
        if (this.simulation)
            this.simulation.stop();
        // TODO: get bounding rect
    }
    // #endregion
    
    // #region [Helper Methods]
    pour_tick(t, x) {
    console.debug('pour', t, x);
    let point = {x, y: 0}
    let nodes = this.simulation.nodes();
    nodes.push(point);
    this.simulation.nodes(nodes);
    this.simulation.restart();
    }

    private ticked() {
    let u = this.drawer.layers.ghost.selectAll('circle').data(this.particles);
    u.enter()
        .append('circle')
        .attr('r', 2)
        .merge(u)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
    u.exit().remove();
    }
    // #endregion
}
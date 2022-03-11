import Simulation from './modules/simulation/simulation.mjs'
import * as PIXI from './modules/pixi/pixi.mjs'

// Example of how you would create a PIXI object
//let app = new PIXI.Application({ width: 640, height: 360 });
//document.body.appendChild(app.view);

//let sim = new Simulation(0, 101,101, 25, 10000, 0.1, 0.05, 20, 1000, false, 1.0, true);
let sim = new Simulation(0, 100,100, 25, 10, 0.1, 0.05, 20, 1000, false, 1.0, true);
sim.runSimulation();
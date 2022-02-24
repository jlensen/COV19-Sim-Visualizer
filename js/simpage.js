import Simulation from './modules/simulation/simulation.mjs'
import * as PIXI from './modules/pixi/pixi.mjs'

// Example of how you would create a PIXI object
let app = new PIXI.Application({ width: 640, height: 360 });
document.body.appendChild(app.view);

//let sim = new Simulation();
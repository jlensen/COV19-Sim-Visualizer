import Simulation from './modules/simulation/simulation.mjs'
import * as PIXI from './modules/pixi/pixi.mjs'

// Example of how you would create a PIXI object
//let app = new PIXI.Application({ width: 640, height: 360 });
//document.body.appendChild(app.view);

//let sim = new Simulation(0, 101,101, 25, 10000, 0.1, 0.05, 20, 1000, false, 1.0, true);
let app = new PIXI.Renderer({ width: 300, height: 300, backgroundColor: 0x1099bb });
let sim = new Simulation(0, 20,20, 1, 100, 0.1, 0.5, 20, 1000, false, 1.0, true, app, 15);
document.body.appendChild(app.view);
//sim.startSim();
//const graphics = new PIXI.Graphics();
//graphics.beginFill(0xDE3249);
//graphics.drawRect(50, 50, 100, 100);
//graphics.endFill();
//app.stage.addChild(graphics);
sim.renderStore()
var ticker = new PIXI.Ticker();
ticker.add(() => {
    if (!sim.hasEnded()) {
        sim.simStep();
        sim.renderCustomers();
    }
}, PIXI.UPDATE_PRIORITY.HIGH);
ticker.start();

let btn = document.createElement("button");
btn.innerHTML = "Click Me";
document.body.appendChild(btn);

//btn.addEventListener("click", startsim.bind(sim))
//btn.addEventListener("click", ticker.start.bind(this))

function startsim() {
    this.runSimulation();
}
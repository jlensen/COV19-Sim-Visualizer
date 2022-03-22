import Simulation from './modules/simulation/simulation.mjs'
import * as PIXI from './modules/pixi/pixi.mjs'

let sim;
let app = new PIXI.Renderer({ width: 300, height: 300, backgroundColor: 0x1099bb });
app.render(new PIXI.Container);
let simparts = [sim, app]
document.getElementById("sim").appendChild(app.view);

let btn = document.getElementById("loadbtn");

btn.addEventListener("click", startsim.bind(simparts))
document.getElementById("stopbtn").addEventListener("click", tickStop.bind(simparts))
//btn.addEventListener("click", ticker.start.bind(this))

function startsim() {
    if (this[0] != undefined && this[0].ticker != null) {
        this[0].ticker.destroy();
    }
    //this.hasEnded = true;
    let n_cust = document.getElementById("n_cust").value;
    let cust_rate = document.getElementById("cust_rate").value;
    let inf_rate = document.getElementById("inf_rate").value;
    let n_shelves = document.getElementById("n_shelves").value;
    let n_steps = document.getElementById("n_steps").value;
    let scale = 1.0;
    this[0] = new Simulation(0, 20, 20, n_shelves, n_cust, cust_rate, inf_rate, 20, n_steps, false, scale, true, this[1], 15);
    this[0].renderStore();
    this[0].startSim();
    //this.hasEnded = false;
    //this.runSimulation();
    var ticker = new PIXI.Ticker();
ticker.add(tickUpdate.bind(this[0]), PIXI.UPDATE_PRIORITY.HIGH);
ticker.start()
    this[0].ticker = ticker;
}

function tickUpdate() {
    if (!this.hasEnded()) {
        this.simStep();
        this.renderCustomers();
    } else {
        this.ticker.destroy();
    }
}

function tickStop() {
    console.log("HEEEEEEEELp")
    this[0].ticker.destroy();
    this[0].ticker = null;
}
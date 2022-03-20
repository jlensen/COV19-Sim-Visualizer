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
    let customer = document.getElementById("parameter1").value;
    let shelves = document.getElementById("parameter2").value;
    let infrate = document.getElementById("parameter3").value
    this[0] = new Simulation(0, 20,20, shelves, customer, 0.1, infrate, 20, 1000, false, 1.0, true, this[1], 15);
    //this.nCustomers = document.getElementById("parameter2").value
    this[0].renderStore()
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
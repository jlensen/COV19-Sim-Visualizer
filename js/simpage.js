import Simulation from './modules/simulation/simulation.mjs'
import * as PIXI from './modules/pixi/pixi.mjs'
import Visualisations from './visualisations.js'
import Heatmaps from './heatmap.js'

let app = new PIXI.Renderer({ width: 300, height: 300, backgroundColor: 0x1099bb });
app.render(new PIXI.Container);
var Lx = 20; 
var Ly = 20;
var vis = new Visualisations(document.getElementById('vis').getContext('2d'), document.getElementById('vis2').getContext('2d'), sim);
var hmp = new Heatmaps(Lx, Ly);
var sim = new Simulation(0, Lx, Ly, 10, 50, 0.1, 0.1, 20, 1000, false, 1.0, true, app, 15, vis, hmp);
document.getElementById("sim").appendChild(app.view);

let btn = document.getElementById("loadbtn");

btn.addEventListener("click", startsim.bind(sim));
document.getElementById("stopbtn").addEventListener("click", sim.stopSim.bind(sim));
//btn.addEventListener("click", ticker.start.bind(this))
document.getElementById("resetZoom").addEventListener("click", vis.resetZoom.bind(vis));


let customer = 0;

function startsim() {
    //stop current sim first
    this.stopSim();

    let n_cust = document.getElementById("n_cust").value;
    let cust_rate = document.getElementById("cust_rate").value;
    let inf_rate = document.getElementById("inf_rate").value;
    let n_shelves = document.getElementById("n_shelves").value;
    let n_steps = document.getElementById("n_steps").value;

    this.nCustomers = n_cust;
    this.probNewCustomer = cust_rate;
    this.probInfCustomer = inf_rate;
    this.nShelves = n_shelves;
    this.maxSteps = n_steps;
    
    this.initState();
    this.renderStore();
    this.startSim();
    //this.hasEnded = false;
    //this.runSimulation();
}


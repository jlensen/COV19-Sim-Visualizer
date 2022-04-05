import Simulation from './modules/simulation/simulation.mjs'
import Editor from './modules/simulation/editor.mjs';
import * as PIXI from './modules/pixi/pixi.mjs'
import Visualisations from './visualisations.js'
import Heatmaps from './heatmap.js'


let simapp = new PIXI.Renderer({ width: 300, height: 300, backgroundColor: 0x1099bb });
simapp.render(new PIXI.Container);
document.getElementById("sim").appendChild(simapp.view);
var Lx = 20; 
var Ly = 20;
var vis = new Visualisations(document.getElementById('vis').getContext('2d'), document.getElementById('vis2').getContext('2d'), sim);
var hmp = new Heatmaps(Lx, Ly);
var sim = new Simulation(0, Lx, Ly, 10, 50, 0.1, 0.1, 20, 1000, false, 1.0, true, simapp, 15, vis, hmp);


let editorapp = new PIXI.Renderer({ width: 700, height: 700, backgroundColor: 0x1099bb });
let editor = new Editor(editorapp, 35);
editor.setStoresize(20, 20);
document.getElementById("editor").appendChild(editorapp.view);

// Editor functionality
editorapp.view.addEventListener('contextmenu', (e) => {
    e.preventDefault();
})

document.getElementById("zoomin").addEventListener("click", () => {
    editor.zoom(true);
})

document.getElementById("zoomout").addEventListener("click", () => {
    editor.zoom(false);
})

document.getElementById("erase").addEventListener("click", () => {
    // TODO add support for selecting different objects to draw
    editor.selected = 0;
})


//btn.addEventListener("click", startsim.bind(sim));
//document.getElementById("stopbtn").addEventListener("click", sim.stopSim.bind(sim));
//btn.addEventListener("click", ticker.start.bind(this))
document.getElementById("resetZoom").addEventListener("click", vis.resetZoom.bind(vis));

document.getElementById("draw").addEventListener("click", () => {
    editor.selected = document.getElementById("objectSelect").value;
})

document.getElementById("objectSelect").addEventListener("change", () => {
    editor.selected = parseInt(document.getElementById("objectSelect").value);
})

document.getElementById("storesize").addEventListener("change", () => {
    let size = parseInt(document.getElementById("storesize").value);
    console.log(size)
    if (size > 100) {
        return;
    }
    editor.setStoresize(size, size);
})



// Sim UI functionality
document.getElementById("loadbtn").addEventListener("click", startsim.bind(sim))
document.getElementById("stopbtn").addEventListener("click", sim.stopSim.bind(sim))
document.getElementById("genbtn").addEventListener("click", () => {
    sim.genStore();
    sim.initState();
    sim.renderStore();
})

document.getElementById("usemapbtn").addEventListener("click", () => {
    sim.loadStore(editor.getMapObject());
    sim.initState();
    sim.renderStore();
})

let customer = 0;

function startsim() {
    let test_bool = true;
    if (!document.getElementById("n_cust").validity.valid) {
        document.getElementById("n_cust_error").innerText = 'Enter a value greater than 0';
        test_bool = false;
    }
    if (!document.getElementById("cust_rate").validity.valid) {
        document.getElementById("cust_rate_error").innerText = 'Enter a value between 0 and 1 with at most 2 decimals';
        test_bool = false;
    }
    if (!document.getElementById("inf_rate").validity.valid) {
        document.getElementById("inf_rate_error").innerText = 'Enter a value between 0 and 1 with at most 2 decimals';
        test_bool = false;
    }
    if (!document.getElementById("n_shelves").validity.valid) {
        document.getElementById("n_shelves_error").innerText = 'Enter a value greater than 0';
        test_bool = false;
    }
    if (!document.getElementById("n_steps").validity.valid) {
        document.getElementById("n_steps_error").innerText = 'Enter a value greater than 0';
        test_bool = false;
    }
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
    if (test_bool) {
        document.getElementById("n_cust_error").innerText = null;
        document.getElementById("cust_rate_error").innerText = null;
        document.getElementById("inf_rate_error").innerText = null;
        document.getElementById("n_shelves_error").innerText = null;
        document.getElementById("n_steps_error").innerText = null;
        this.startSim();
    }
    //this.hasEnded = false;
    //this.runSimulation();
}


import Simulation from './modules/simulation/simulation.mjs';
import Editor from './modules/simulation/editor.mjs';
import * as PIXI from './modules/pixi/pixi.mjs';
import Visualisations from './visualisations.js';
import VisB from './visB.js';
import Heatmaps from './heatmap.js';
import { params } from './modules/simulation/util.mjs';

// INIT SIMULATION
let simapp = new PIXI.Renderer({ width: 0.3 * document.body.clientWidth, height: 0.3 * document.body.clientWidth, backgroundColor: 0x1099bb });
simapp.render(new PIXI.Container);
document.getElementById("sim").appendChild(simapp.view);
var Lx = 20; 
var Ly = 20;
var vis = new Visualisations(document.getElementById('vis').getContext('2d'), document.getElementById('vis2').getContext('2d'));
//var visB = new VisB(document.getElementById('visB1').getContext('2d'), document.getElementById('visB2').getContext('2d'));
var hmp = new Heatmaps(Lx, Ly);

var sim = new Simulation(0, Lx, Ly, 10, 50, 0.1, 0.1, 20, 1000, true, 1.0, simapp, 15, vis, hmp);


// INIT EDITOR
let editordiv = document.getElementById("editor")
let editorapp = new PIXI.Renderer({ width: 0.3 * document.body.clientWidth, height: 0.3 * document.body.clientWidth, backgroundColor: 0x1099bb });
let editor = new Editor(editorapp, 35);
editor.setStoresize(20, 20);
editordiv.appendChild(editorapp.view)

// GENERAL UI

// disable sim button before a map is loaded
document.getElementById("loadbtn").setAttribute("disabled", "");
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

// SIM UI FUNCTIONALITY
document.getElementById("stopbtn").addEventListener("click", () => {
    sim.pauseSim();
    if (sim.paused) {
        document.getElementById("stopbtn").innerHTML = "Resume";
    } else {
        document.getElementById("stopbtn").innerHTML = "Pause";
    }
})
document.getElementById("genbtn").addEventListener("click", () => {
    sim.genStore();
    sim.initState();
    sim.renderStore();
    document.getElementById("loadbtn").removeAttribute("disabled");
})


document.getElementById("usemapbtn").addEventListener("click", () => {
    sim.loadStore(editor.getMapObject());
    sim.initState();
    sim.renderStore();
    document.getElementById("loadbtn").removeAttribute("disabled");
})

// resize canvas for sim and editor when page resizes
window.addEventListener("resize", () => {
    editorapp.resize(0.3 * document.body.clientWidth, 0.3 * document.body.clientWidth);
    editor.scale = Math.floor((0.3 * document.body.clientWidth) / editor.grid.length);
    editor.init();
    editor.render();

    simapp.resize(0.3 * document.body.clientWidth, 0.3 * document.body.clientWidth);
    sim.scale = Math.floor((0.3 * document.body.clientWidth) / editor.grid.length);
    sim.app.render(sim.stage)
    if (sim.store != null) 
        sim.renderStore();
    if (sim.customers != null)
        sim.renderCustomers();
})

let startsim = () => {

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
    
    sim.stopSim();
    document.getElementById("loadbtn").setAttribute("disabled", "");
    sim.renderStore();
    sim.initState();
    //sim.renderStore();

    let n_cust = document.getElementById("n_cust").value;
    let cust_rate = document.getElementById("cust_rate").value;
    let inf_rate = document.getElementById("inf_rate").value;
    let n_shelves = document.getElementById("n_shelves").value;
    let n_steps = document.getElementById("n_steps").value;
    let masks = document.getElementById("mask").checked;
    let cont_const = document.getElementById("cont_const").value;
    let cont_inc = document.getElementById("cont_inc").value;

    sim.nCustomers = n_cust;
    sim.probNewCustomer = cust_rate;
    sim.probInfCustomer = inf_rate;
    sim.nShelves = n_shelves;
    sim.maxSteps = n_steps;
    if (masks) {
        params.PLUMECONCCONT = parseFloat(cont_const);
        params.PLUMECONCINC = parseFloat(cont_inc);
    } else {
        params.PLUMECONCCONT = 5.0;
        params.PLUMECONCINC = 40000.0;
    }
    if (test_bool) {
        document.getElementById("n_cust_error").innerText = null;
        document.getElementById("cust_rate_error").innerText = null;
        document.getElementById("inf_rate_error").innerText = null;
        document.getElementById("n_shelves_error").innerText = null;
        document.getElementById("n_steps_error").innerText = null;
        sim.startSim();
    }
    //this.hasEnded = false;
    //this.runSimulation();
}

document.getElementById("loadbtn").addEventListener("click", startsim)

import Simulation from './modules/simulation/simulation.mjs'
import Editor from './modules/simulation/editor.mjs';
import * as PIXI from './modules/pixi/pixi.mjs'

let simapp = new PIXI.Renderer({ width: 300, height: 300, backgroundColor: 0x1099bb });
simapp.render(new PIXI.Container);
let sim = new Simulation(0, 20, 20, 10, 50, 0.1, 0.1, 20, 1000, 1.0, true, simapp, 15);
document.getElementById("sim").appendChild(simapp.view);

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

document.getElementById("draw").addEventListener("click", () => {
    editor.selected = document.getElementById("objectSelect").value;
})

document.getElementById("objectSelect").addEventListener("change", () => {
    editor.selected = parseInt(document.getElementById("objectSelect").value);
})

document.getElementById("storesize").addEventListener("change", () => {
    let size = parseInt(document.getElementById("storesize").value);
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
    this.startSim();
    //this.hasEnded = false;
    //this.runSimulation();
}
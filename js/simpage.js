import Simulation from './modules/simulation/simulation.mjs'
import Editor from './modules/simulation/editor.mjs';
import * as PIXI from './modules/pixi/pixi.mjs'
import Visualisations from './visualisations.js'


let simapp = new PIXI.Renderer({ width: 0.3 * document.body.clientWidth, height: 0.3 * document.body.clientWidth, backgroundColor: 0x1099bb });
simapp.render(new PIXI.Container);
var vis = new Visualisations(document.getElementById('vis').getContext('2d'), document.getElementById('vis2').getContext('2d'), sim);
var sim = new Simulation(0, 20, 20, 10, 50, 0.1, 0.1, 20, 1000, true, 1.0, simapp, 15, vis);
document.getElementById("sim").appendChild(simapp.view);

let editordiv = document.getElementById("editor")
let editorapp = new PIXI.Renderer({ width: 0.3 * document.body.clientWidth, height: 0.3 * document.body.clientWidth, backgroundColor: 0x1099bb });
let editor = new Editor(editorapp, 35);
editor.setStoresize(20, 20);
editordiv.appendChild(editorapp.view)

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
document.getElementById("stopbtn").addEventListener("click", sim.pauseSim.bind(sim))
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

let customer = 0;

let startsim = () => {
    console.log("start")
    //stop current sim first
    document.getElementById("loadbtn").setAttribute("disabled", "");
    sim.stopSim();
    sim.renderStore();
    sim.initState();
    //sim.renderStore();

    let n_cust = document.getElementById("n_cust").value;
    let cust_rate = document.getElementById("cust_rate").value;
    let inf_rate = document.getElementById("inf_rate").value;
    let n_shelves = document.getElementById("n_shelves").value;
    let n_steps = document.getElementById("n_steps").value;

    sim.nCustomers = n_cust;
    sim.probNewCustomer = cust_rate;
    sim.probInfCustomer = inf_rate;
    sim.nShelves = n_shelves;
    sim.maxSteps = n_steps;
    sim.startSim();
    //this.hasEnded = false;
    //this.runSimulation();
}

document.getElementById("loadbtn").addEventListener("click", startsim)

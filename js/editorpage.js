import Editor from './modules/simulation/editor.mjs';
import * as PIXI from './modules/pixi/pixi.mjs'

let app = new PIXI.Renderer({ width: 700, height: 700, backgroundColor: 0x1099bb });
let editor = new Editor(app, 20);
editor.setStoresize(35, 35);
console.log(editor)
document.getElementById("editor").appendChild(app.view);

app.view.addEventListener('contextmenu', (e) => {
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
    editor.selected = document.getElementById("objectSelect").value;
})

document.getElementById("storesize").addEventListener("change", () => {
    let size = parseInt(document.getElementById("storesize").value)
    editor.setStoresize(size, size);
})


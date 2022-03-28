import { Container, Graphics, Rectangle } from '../pixi/pixi.mjs';

class Editor {
    constructor(app, scale) {
        this.grid = null;
        this.scale = scale;
        this.app = app;
        this.stage = new Container();
 
        // Holds objects that are draw such as shelves, exits
        this.objects = new Graphics();
        this.objects.interactive = true;
        this.objects.on("mousedown", this.handleClick.bind(this));
        this.objects.on("mousemove", this.handleDrag.bind(this));
        this.objects.on("mouseup", this.handleRelease.bind(this));
        this.objects.hitArea = new Rectangle(0, 0, 300, 300);

        // Holds background pattern
        this.background = new Graphics();
        this.background.interactive = false;

        this.stage.addChild(this.background);
        this.stage.addChild(this.objects);
        this.app.render(this.stage);

        this.dragging = false;

        // The current selected object to place
        // 0 is eraser
        this.selected = 1;
    }

    setStoresize(x, y) {
        this.grid = new Array(x);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(y).fill(0);
        }
    }

    init() {
        let colorChange;
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                colorChange = j % 2 == 0;
                if (i % 2 == 0) 
                    colorChange = !colorChange;
                if (colorChange) {
                    this.background.beginFill(0xadadac);
                } else {
                    this.background.beginFill(0xdbdbdb);
                }
                //this.background.beginFill(0x1c1f1d);
                this.background.drawRect(this.scale * i, this.scale * j, this.scale, this.scale);
                this.background.endFill();
            }
        }
        this.app.render(this.stage);
    }

    render() {
        this.objects.clear();
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j] == 1) {
                    this.objects.beginFill(0xff69b4);
                } else {
                    continue;
                }
                //this.graphics.beginFill(0x1c1f1d);
                this.objects.drawRect(this.scale * i, this.scale * j, this.scale, this.scale);
                this.objects.endFill();
            }
        }
        this.app.render(this.stage);
    }

    handleClick(event) {
        // set dragging to true, so if we move the mouse handleDRag will know we can still draw
        this.dragging = true;
        let x = Math.floor(event.data.global.x / this.scale);
        let y = Math.floor(event.data.global.y / this.scale);
        this.grid[x][y] = this.selected;
        this.render();
    }

    handleDrag(event) {
        // if dragging we can just place objects
        if (this.dragging) {
            this.handleClick(event);
        }
    }

    handleRelease() {
        this.dragging = false;
    }
}

export default Editor;
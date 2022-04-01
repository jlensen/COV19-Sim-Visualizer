import { Container, Graphics, Rectangle } from '../pixi/pixi.mjs';

class Editor {
    constructor(app, scale) {
        this.grid = null;
        this.entrance = null;
        this.exits = [];
        this.scale = scale;
        this.app = app;
        this.stage = new Container();
        this.stage.interactive = true;
        this.stage.on("pointerdown", this.handleMoveClick.bind(this));
        this.stage.on("pointermove", this.handleMoveDrag.bind(this));
        this.stage.on("pointerup", this.handleMoveRelease.bind(this));
        this.stage.hitArea = new Rectangle(0, 0, this.app.width, this.app.height);

        // Holds objects that are draw such as shelves, exits
        this.objects = new Graphics();
        this.objects.interactive = true;
        this.objects.on("pointerdown", this.handleDrawClick.bind(this));
        this.objects.on("pointermove", this.handleDrawDrag.bind(this));
        this.objects.on("pointerup", this.handleDrawRelease.bind(this));
        this.objects.hitArea = new Rectangle(0, 0, this.app.width, this.app.height);

        // Holds background pattern
        this.background = new Graphics();
        this.background.interactive = false;

        this.editorContents = new Container();

        this.editorContents.addChild(this.background);
        this.editorContents.addChild(this.objects);
        this.stage.addChild(this.editorContents);
        this.app.render(this.stage);

        this.drawDrag = false;
        this.moveDrag = false;

        // The current selected object to place
        // 0 is eraser
        this.selected = 1;
    }

    setStoresize(x, y) {
        this.grid = new Array(x);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(y).fill(0);
        }
        this.objects.clear();
        this.background.clear();
        this.init();
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
                    this.objects.beginFill(0x121111);
                } else {
                    continue;
                }
                this.objects.drawRect(this.scale * i, this.scale * j, this.scale, this.scale);
                this.objects.endFill();
            }
        }
        if (this.entrance != null) {
            this.objects.beginFill(0x9ad94e);
            this.objects.drawRect(this.scale * this.entrance[0], this.scale * this.entrance[1], this.scale, this.scale);
            this.objects.endFill();
        }
        
        for (let i = 0; i < this.exits.length; i++) {
            this.objects.beginFill(0x8a4225);
            this.objects.drawRect(this.scale * this.exits[i][0], this.scale * this.exits[i][1], this.scale, this.scale);
            this.objects.endFill();
        }
        this.app.render(this.stage);
    }

    handleDrawClick(event) {
        // set dragging to true, so if we move the mouse handleDRag will know we can still draw
        if (event.data.button != 0) {
            return;
        }
        this.drawDrag = true;
        let pos = event.data.getLocalPosition(this.objects);
        let x = Math.floor(pos.x / this.scale);
        let y = Math.floor(pos.y / this.scale);
        if (x < this.grid.length && y < this.grid.length) {
            if (this.selected == 1) {
                this.grid[x][y] = this.selected;
            } else if (this.selected == 2 && this.entrance == null) {
                this.entrance = [x, y];
            } else if (this.selected == 3) {
                this.exits.push([x, y]);
            }
            this.render();
        }
    }

    handleDrawDrag(event) {
        // if dragging we can just place objects
        if (this.drawDrag) {
            //this.handleDrawClick(event);
            let pos = event.data.getLocalPosition(this.objects);
            let x = Math.floor(pos.x / this.scale);
            let y = Math.floor(pos.y / this.scale);
            if (x < this.grid.length && y < this.grid.length) {
                if (this.selected == 1) {
                    this.grid[x][y] = this.selected;
                } else if (this.selected == 2 && this.entrance.length == null) {
                    this.entrance = [x, y];
                } else if (this.selected == 3) {
                    this.exits.push([x, y]);
                }
                this.render();
            }
        }
    }

    handleDrawRelease() {
        this.drawDrag = false;
    }

    handleMoveClick(event) {
        if (event.data.button == 2)
            this.moveDrag = true;
    }

    handleMoveDrag(event) {
        if (this.moveDrag) {
            this.editorContents.position.x += event.data.originalEvent.movementX;
            this.editorContents.position.y += event.data.originalEvent.movementY;
            this.render();
        }
    }

    handleMoveRelease() {
        this.moveDrag = false;
    }

    // zooms in the given direction. True for in and false for out
    zoom(direction) {
        // TODO scaling amount needs to be determined sometime
        let amount = direction ? 1.25 : 0.75;
        this.editorContents.scale.x *= amount;
        this.editorContents.scale.y *= amount;
        this.render();
    }

    getMapObject() {
        console.log(this.grid)
        console.log(this.exits)
        console.log(this.entrances)
        return {
            grid: this.grid,
            exits: this.exits,
            entrance: this.entrance,
        }
    }
}

export default Editor;
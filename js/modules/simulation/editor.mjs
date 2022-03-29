import { Container, Graphics, Rectangle } from '../pixi/pixi.mjs';

class Editor {
    constructor(app, scale) {
        this.grid = null;
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

    handleDrawClick(event) {
        // set dragging to true, so if we move the mouse handleDRag will know we can still draw
        console.log("wat")
        if (event.data.button == 0) {
        this.drawDrag = true;
        let pos = event.data.getLocalPosition(this.objects);
        let x = Math.floor(pos.x / this.scale);
        let y = Math.floor(pos.y / this.scale);
        this.grid[x][y] = this.selected;
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
        this.grid[x][y] = this.selected;
        this.render();
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
        let amount = direction ? 2 : 0.5;
        this.editorContents.scale.x *= amount;
        this.editorContents.scale.y *= amount;
        this.render();
    }
}

export default Editor;
import { Container, Graphics } from '../pixi/pixi.mjs';

class Editor {
    constructor(app) {
        this.grid = null;
        this.app = app;
        this.stage = new Container();
        this.graphics = new Graphics();
        this.graphics.interactive = true;
        this.graphics.on("pointerdown", this.handleClick.bind(this));
        this.stage.addChild(this.graphics);
        this.app.render(this.stage);
    }

    setStoresize(x, y) {
        this.grid = new Array(x);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(y).fill(0);
        }
    }

    init() {
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                this.graphics.beginFill(0x1c1f1d);
                this.graphics.drawRect(3 * i, 3 * j, 3, 3);
                this.graphics.endFill();
            }
        }
        this.app.render(this.stage);
    }

    render() {
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j] == 1) {
                    this.graphics.beginFill(0xff69b4);
                } else {
                    this.graphics.beginFill(0x1c1f1d);
                }
                //this.graphics.beginFill(0x1c1f1d);
                this.graphics.drawRect(3 * i, 3 * j, 3, 3);
                this.graphics.endFill();
            }
        }
        this.app.render(this.stage);
    }

    handleClick(event) {
        console.log(event.data.global.x, event.data.global.y);
        let x = Math.round(event.data.global.x / 3);
        let y = Math.round(event.data.global.y / 3);
        console.log(x, y);
        this.grid[x][y] = 1;
        this.render();
    }
}

export default Editor;
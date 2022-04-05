import {permuteArray, params, randRange, checkCoordIn2DArray} from './util.mjs'

const DIRECTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]];

class Customer {

    constructor(x, y, infected, probSpreadPlume = params.PROBSPREADPLUME) {
        this.x = x;
        this.y = y;
        this.infected = infected;
        this.shoppingList = [];
        this.path = null;
        this.probSpreadPlume = probSpreadPlume;
        this.exposure = 0;
        this.exposureTime = 0;
        this.exposureTimeThres = 0;
        this.timeInStore = 0;
        this.initItemsList = null;
        this.cashierWaitingTime = null;
        this.waitingTime = 0;
        this.headingForExit = 0;
    }

    // should be an array with only an x and a y.
    // better to rework that later by using explicitly a point
    addTarget(target) {
        this.shoppingList.push(target);
    }

    // Assumes customer behaves logically, so goes to closest product on list first
    updateFirstTarget(store) {
        let shortestDist = 1e8;
        let shortInd = null;

        let startInd = store.getIndexFromCoord([this.x, this.y]);

        for (let i = 0; i < this.shoppingList.length; i++) {
            let targetInd = store.getIndexFromCoord(this.shoppingList[i]);
            let thisDist = store.graph.shortestPath(startInd, targetInd).length;
            if (thisDist < shortestDist) {
                shortestDist = thisDist;
                shortInd = i;
            }
        }
        if (shortInd == null) {
            // can throw error if we want
        } else {
            // add specified item at the beginning and remove value at its original position
            this.shoppingList.splice(0, 0, this.shoppingList[shortInd]);
            this.shoppingList.splice(shortInd + 1, 1);
        }
    }

    itemFound() {
        if (this.shoppingList.length == 0) {
            return false;
        }
        let itemPos = this.shoppingList[0];
        if (this.x == itemPos[0] && this.y == itemPos[1]) {
            return true;
        }
        return false;
    }

    spreadViralPlumes(store) {
        let sample = Math.random();
        if (sample < this.probSpreadPlume && !store.useDiffusion) {
            store.plumes[this.x][this.y] = params.PLUMELIFETIME;
        } else if (store.useDiffusion) {
            if (sample < this.probSpreadPlume) {
                store.plumes[this.x][this.y] += params.PLUMECONCINC;
                // can print that customer coughed as well, but probably not needed
            } else {
                store.plumes[this.x][this.y] += params.PLUMECONCCONT;
            }
        }
    }

    initShoppingList(store, maxN) {
        let targetsDrawn = randRange(0, maxN) + 1;
        while (this.shoppingList.length < targetsDrawn) {
            let tx = randRange(0, store.Lx);
            // from 1 so customers don't run into other customers visiting cashiers
            let ty = randRange(1, store.Ly);
            while (store.blocked[tx][ty] == 1 || checkCoordIn2DArray(tx, ty, this.shoppingList) || checkCoordIn2DArray(tx, ty, store.exit)
            || (store.entrance[0] == tx && store.entrance[1] == ty) || (tx < 1 || ty < 1) || (tx < 3 && ty < 3) ||
            !(store.blockedShelves[tx][ty - 1] == 1 || (ty + 1 < store.Ly && store.blockedShelves[tx][ty + 1] == 1) ||
            (tx - 1 >= 0 || store.blockedShelves[tx - 1][ty] == 1) || (tx + 1 < store.Lx && (store.blockedShelves[tx + 1][ty] == 1 && store.blockedShelves[tx + 1][ty] != undefined)))) {
                store.blocked[tx][ty] == 1
                tx = randRange(0, store.Lx);
                ty = randRange(1, store.Ly);
            }
            this.addTarget([tx, ty]);
        }
        this.initItemsList = this.shoppingList.length;
        this.cashierWaitingTime = params.CASHIERTIMEPERITEM * targetsDrawn;
        return targetsDrawn;
    }

    // return some stats
    getFinalStats() {
        return [this.infected, this.initItemsList, this.timeInStore, this.exposure, this.exposureTime, this.exposureTimeThres];
    }

    takeRandomStep(store) {
        let permDir = permuteArray(DIRECTIONS);
        for (let i = 0; i < permDir.length; i++) {
            let step = permDir[i];
            let tmpPos = [parseInt(this.x) + parseInt(step[0]), parseInt(this.y) + parseInt(step[1])];
            if (tmpPos[0] < 0 || tmpPos[0] >= store.Lx || tmpPos[1] < 0 || tmpPos[1] >= store.Ly) {
                continue;
            }  else if (store.blocked[tmpPos[0]][tmpPos[1]] == 1) {
                continue;
            } else {
                store.blocked[this.x][this.y] = 0;
                this.x = tmpPos[0];
                this.y = tmpPos[1];
                store.blocked[this.x][this.y] = 1;
                break;
            }
        }
        return [this.x, this.y];
    }

    atExit(store) {
        for (let i = 0; i < store.exit.length; i++) {
            if (this.x == store.exit[i][0] && this.y == store.exit[i][1]) {
                return true;
            }
        }
        return false;
    }
}

class SmartCustomer extends Customer {
    constructor(x, y, infected, probSpreadPlume = params.PROBSPREADPLUME) {
        super(x, y, infected, probSpreadPlume);
    }

    takeStep(store) {
        if (store.plumes[this.x][this.y] > 0 && !store.useDiffusion) {
            this.exposure += 1;
        } else if (store.plumes[this.x][this.y] > 0 && store.useDiffusion) {
            this.exposure += store.plumes[this.x][this.y] * store.dt;
            if (this.infected == 0)
                store.storeWideExposure += store.plumes[this.x][this.y] * store.dt;
            if (store.plumes[this.x][this.y] > 0) {
                this.exposureTime += 1;
                if (store.plumes[this.x][this.y] > params.EXPOSURELIMIT) 
                    this.exposureTimeThres += 1;
            }
        }

        if (this.infected == 1) 
            this.spreadViralPlumes(store);

        // TODO make sure this is correct
        if (this.waitingTime > 0) {
            this.waitingTime -= 1;
            return [this.x, this.y];
        }

        // heading for exit
        if (this.shoppingList.length == 0) {
            if (!this.atExit(store)) {
                console.log("not at exit", this.waitingTime)
                this.shoppingList.push(store.getExit());
                this.headingForExit = 1;
            } else if (this.atExit(store) && this.cashierWaitingTime > 0) {
                console.log("now just waiting")
                this.cashierWaitingTime -= 1;
                return [this.x, this.y]; 
            } else {
                console.log("yes can exit")
                store.blocked[this.x][this.y] = 0;
                return [-1, -1];
            }
        }

        if (this.itemFound()) {
            let itemPos = this.shoppingList.shift();
            this.waitingTime = randRange(params.MINWAITINGTIME, params.MAXWAITINGTIME);
            return itemPos;
        }

        if (this.path == null || this.path.length == 0) {
            this.updateFirstTarget(store);
            let startInd = store.getIndexFromCoord([this.x, this.y]);
            let targetInd = store.getIndexFromCoord(this.shoppingList[0]);

            this.path = store.graph.shortestPath(startInd, targetInd);
            this.path.shift();

            if (!(this.path.length > 0)) {
                let itemPos = this.shoppingList.shift();
                return itemPos;
            }
        }

        if (!(this.path.length > 0)) {
            console.log(this.x, this.y, this.shoppingList, this.headingForExit);
        }
        let step = store.getCoordFromIndex(this.path[0]);
        // check that step is possible
        if (store.blocked[step[0]][step[1]] == 0) {
            store.blocked[this.x][this.y] = 0;
            this.x = step[0];
            this.y = step[1];
            store.blocked[this.x][this.y] = 1;
            this.path.shift();
            if (!(this.path.length > 0)) {
                this.path = null;
            }

        } else if (store.Lx * store.Ly < 101 && this.timeInStore % 180 == 0) {
            // sanity check for sims with small environments
            store.createStaticGraph();
            this.path = null;
        } else if ((this.headingForExit == 0 && Math.random() < params.BLOCKRANDOMSTEP) || Math.random() < params.BLOCKRANDOMSTEP * 1e-2) {
            this.takeRandomStep(store);
            this.path = null;
        }

        return [this.x, this.y];
    }
}

export default SmartCustomer;
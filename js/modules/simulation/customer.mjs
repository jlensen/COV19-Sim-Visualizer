import {params, randRange, checkCoordIn2DArray} from './util.mjs'

const DIRECTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]];

class Customer {

    constructor(x, y, infected = 0, probSpreadPlume = params.PROBSPREADPLUME) {
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

    // Assumes custome rbehaves logically, so goes to closest product on list first
    updateFirstTarget(store) {
        let shortestDist;
        let shortInd = null;

        let startInd = store.getIndexFromCoord([this.x, this.y]);

        for (let i = 0; i < this.shoppingList.length; i++) {
            let targetInd = store.getIndexFromCoord(this.shoppingList[i]);
            let thisDist = store.graph.shortestPath(startInd, targetInd);
            if (thisDist < shortestDist) {
                shortestDist = thisDist;
                shortInd = i;
            }
        }
        if (shortInd == null) {
            // can thorw error if we want
        } else {
            // add specified item at the beginning and remove value at its original position
            this.shoppingList.splice(0, 0, this.shoppingList[shortInd]);
            this.shoppingList.splice(shortInd, 1);
        }
    }

    itemFound() {
        if (this.shoppingList.length == 0) {
            return;
        }
        console.log(this.shoppingList.length, this.shoppingList[0], this.shoppingList[1])
        let itemPos = this.shoppingList[0];
        if (this.x == itemPos[0] && this.y == itemPos[1]) {
            return true;
        }
        return false;
    }

    spreadViralPlumes(store) {
        let sample = Math.random();
        if (sample < this.probSpreadPlume && !store.useDiffusion) {
            store.plumes[this.x, this.y] = params.PLUMELIFETIME;
        } else if (store.useDiffusion) {
            if (sample < this.probSpreadPlume) {
                store.plumes[this.x, this.y] += params.PLUMECONCINC;
                // can print that customer coughed as well, but probably not needed
            } else {
                store.plumes[this.x, this.y] += params.PLUMECONCCONT;
            }
        }
    }

    initShoppingList(store, maxN) {
        let targetsDrawn = randRange(0, maxN) + 1;
        while (this.shoppingList.length < targetsDrawn) {
            console.log("still shoppinglist")
            let tx = randRange(0, store.Lx);
            // from 1 so customers don't run into other customers visiting cashiers
            let ty = randRange(1, store.Ly);
            //console.log(store.blocked);
            //console.log(store.blocked[tx][ty]);
            //console.log(checkCoordIn2DArray(tx, ty, this.shoppingList))
            //console.log(checkCoordIn2DArray(tx, ty, store.exit))
            //console.log((store.entrance[0] == tx && store.entrance[1] == ty))
            //console.log(store.blockedShelves[tx][ty - 1] == 0 && store.blockedShelves[tx][ty - 1] != undefined) 
            //break;
            // TODO expand this while loop check, see how to do it in javascript
            while (store.blocked[tx][ty] == 1 || checkCoordIn2DArray(tx, ty, this.shoppingList) || checkCoordIn2DArray(tx, ty, store.exit)
            || (store.entrance[0] == tx && store.entrance[1] == ty) || (tx < 1 || ty < 1) || (tx < 3 && ty < 3) ||
            !(store.blockedShelves[tx][ty - 1] == 1 || (ty + 1 < store.Ly && store.blockedShelves[tx][ty + 1] == 1)) ||
            store.blockedShelves[tx - 1][ty] == 1 || (tx + 1 < store.Lx && (store.blockedShelves[tx + 1][ty] == 1 && store.blockedShelves[tx + 1][ty] != undefined))) {
                console.log("help");
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
        // TODO actually need to permute directions
        for (let i = 0; i < DIRECTIONS.length; i++) {
            let step = DIRECTIONS[i];
            let tmpPos = [this.x + step, this.y + step];

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
        store.exit.forEach((s) => {
            if (this.x == s[0] && this.y == s[1]) {
                return 1;
            }
            return 0;
        })
    }
}

class SmartCustomer extends Customer {
    constructor(x, y, infected = 0, probSpreadPlume = params.PROBSPREADPLUME) {
        super(x, y, infected = 0, probSpreadPlume = params.PROBSPREADPLUME);
    }

    takeStep(store) {
        this.timeInStore += 1;
        if (store.plumes[this.x][this.y] == 1 && !store.useDiffusion) {
            this.exposure += 1;
        } else if (store.plumes[this.x][this.y] == 1 && store.useDiffusion) {
            this.exposure += store.plumes[this.x][this.y] * store.dt;
            if (!this.infected)
                store.storeWideExposure += store.plumes[this.x][this.y] * store.dt;
            if (store.plumes[this.x][this.y] > 0) {
                this.exposureTime += 1;
                if (store.plumes[self.x][self.y] > params.EXPOSURELIMIT) 
                    this.exposureTimeThres += 1;
            }
        }

        if (this.infected) 
            this.spreadViralPlumes(store);

        // TODO make sure this is correct
        if (this.waitingTime > 0) {
            this.waitingTime -= 1;
            return [this.x, this.y];
        }

        if (!(this.shoppingList.length > 0)) {
            if (!this.atExit(store)) {
                this.shoppingList.push(store.getExit());
                this.headingForExit = 1;
            } else if (this.atExit(store) && this.cashierWaitingTime > 0) {
                this.cashierWaitingTime -= 1;
                return [this.x, this.y]; 
            } else {
                store.blocked[this.x][this.y] = 0;
                return [-1, -1];
            }
        }

        if (this.itemFound()) {
            let itemPos = this.shoppingList.shift();
            this.waitingTime = randRange(params.MINWAITINGTIME, params.MAXWAITINGTIME);
            return itemPos;
        }

        if (this.path == null || !(this.path.length > 0)) {
            this.updateFirstTarget(store);
            let startInd = store.getIndexFromCoord([this.x, this.y]);
            let targetInd = store.getIndexFromCoord(this.shoppingList[0]);

            this.path = store.graph.shortestPath(startInd, targetInd);
            this.path.shift();

            if (!(this.path.length > 0)) {
                itemPos = this.shoppingList.shift();
                return itemPos;
            }
        }

        if (!(this.path.length > 0)) {
            console.log(this.x, this.y, this.shoppingList, this.headingForExit);
        }

        let step = store.getCoordFromIndex(this.path[0]);
        // check that step is possible
        if (!store.blocked[step[0]][step[1]]) {
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
        } else if ((!this.headingForExit && Math.random() < params.BLOCKRANDOMSTEP) || Math.random() < params.BLOCKRANDOMSTEP * 1e-2) {
            this.takeRandomStep(store);
            this.path = null;
        }

        return [this.x, this.y];
    }
}

export default SmartCustomer;
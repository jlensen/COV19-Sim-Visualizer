import params from './params.mjs'

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
            let thisDist;
            // TODO find out how to find paths i nthe store, original uses a graph with dijkstra
            // probably need to change the way we handle the store for our version
            //let thisDist = ...;
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

        let itemPos = this.shoppingList[0];
        if (this.x == itemPos[0] && this.y == itemPos[1]) {
            return true;
        }
        return false;
    }

    spreadViralPlumes(store) {
        // TODO check this random
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
        // TODO random needs to be scaled here as well
        let targetsDrawn = Math.random();
        while (this.shoppingList.length < targetsDrawn) {
            let tx = Math.random();
            let ty = Math.random();
            // TODO expand this while loop check, see how to do it in javascript
            while (store.blocked[tx, ty]) {
                tx = Math.random();
                ty = Math.random();
            }
            this.addTarget([tx, ty]);
        }
        this.initItemsList = this.shoppingList.length;
        this.cashierWaitingTime = params.CASHIERTIMEPERITEM * targetsDrawn;
        return targetsDrawn;
    }

    // return some stats
    getFinalStats() {
        
    }

    takeRandomStep() {

    }
}

class SmartCustomer extends Customer {
    constructor() {

    }

    takeStep() {
        
    }
}
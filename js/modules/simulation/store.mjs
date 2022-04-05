import {params, randRange} from './util.mjs'

class Store {
    constructor(dx, randomGen) {
        this.dt = 1.0;
        this.dx = dx;
        this.dy = dx;
        this.randomGen = randomGen;
    }

    loadMap(mapObject) {
        this.Lx = mapObject.grid.length;
        this.Ly = mapObject.grid.length;
        this.blocked = mapObject.grid;
        this.blockedShelves = mapObject.grid;
        this.invLxLy = 1.0 / (this.Lx * this.Ly);
        this.useDiffusion = false;
        this.entrance = mapObject.entrance;
        this.exit = mapObject.exits;
        this.exitActive = new Array(mapObject.exits.length).fill(0);
        this.graph;
        this.initState();
    }

    genMap(Lx, Ly) {
        this.Lx = Lx;
        this.Ly = Ly;
        //this.blocked = null
        this.blocked = new Array(this.Lx);
        for (let i = 0; i < this.blocked.length; i++) {
            this.blocked[i] = new Array(this.Ly).fill(0);
        }
        this.blockedShelves = null;
        this.invLxLy = 1.0 / (this.Lx * this.Ly);
        this.entrance = null;
        this.useDiffusion = false;
        this.exit = [];
        this.exitActive = new Array(params.NEXITS).fill(0);
        this.graph;
        this.initState();
    }

    initState() {
        this.plumes = new Array(this.Lx);
        for (let i = 0; i < this.plumes.length; i++) {
            this.plumes[i] = new Array(this.Ly).fill(0.0);
        }
        this.plumesNew = new Array(this.Lx);
        for (let i = 0; i < this.plumesNew.length; i++) {
            this.plumesNew[i] = new Array(this.Ly).fill(0.0);
        }
        this.plumesIntegrated = new Array(this.Lx);
        for (let i = 0; i < this.plumesIntegrated.length; i++) {
            this.plumesIntegrated[i] = new Array(this.Ly).fill(0.0);
        }
        this.diffusionCoeff = new Array(this.Lx);
        for (let i = 0; i < this.diffusionCoeff.length; i++) {
            this.diffusionCoeff[i] = new Array(this.Ly).fill(params.DIFFCOEFF);
        }
        this.ACSinkCoeff = new Array(this.Lx);
        for (let i = 0; i < this.ACSinkCoeff.length; i++) {
            this.ACSinkCoeff[i] = new Array(this.Ly).fill(params.ACSINKCOEFF);
        }
        this.storeWideExposure = 0;
    }

    initializeExposureDuringTimeStep() {
        this.storeWideExposure = 0;
    }

    // TODO check this, exposure seems to be high
    updateDiffusion() {
        this.plumesNew = this.plumes.map((a) => a.slice())

        // TODO lots of loops, maybe we can combine some of them?
        for (let i = 1; i < this.plumesNew.length; i++) {
            for (let j = 0; j < this.plumesNew[i].length; j++) {
                this.plumesNew[i][j] = this.plumesNew[i][j] + (this.diffusionCoeff[i][j] * this.diffusionCoeff[i-1][j] * this.dt * (this.plumes[i-1][j] - this.plumes[i][j])/Math.pow(this.dx, 2) / params.DIFFCOEFF);
            }
        }
       

        for (let i = 0; i < this.plumesNew.length - 1; i++) {
            for (let j = 0; j < this.plumesNew[i].length; j++) {
                this.plumesNew[i][j] += this.diffusionCoeff[i][j] * this.diffusionCoeff[i+1][j] * this.dt * (this.plumes[i+1][j] - this.plumes[i][j])/Math.pow(this.dx, 2) / params.DIFFCOEFF;
            }
        }

        for (let i = 0; i < this.plumesNew.length; i++) {
            for (let j = 1; j < this.plumesNew[i].length; j++) {
                this.plumesNew[i][j] += this.diffusionCoeff[i][j] * this.diffusionCoeff[i][j-1] * this.dt * (this.plumes[i][j-1] - this.plumes[i][j])/Math.pow(this.dy, 2) / params.DIFFCOEFF;
            }
        }

        for (let i = 0; i < this.plumesNew.length; i++) {
            for (let j = 0; j < this.plumesNew[i].length - 1; j++) {
                this.plumesNew[i][j] += this.diffusionCoeff[i][j] * this.diffusionCoeff[i][j+1] * this.dt * (this.plumes[i][j+1] - this.plumes[i][j])/Math.pow(this.dy, 2) / params.DIFFCOEFF;
            }
        }

        for (let i = 0; i < this.plumesNew.length; i++) {
            for (let j = 0; j < this.plumesNew[i].length; j++) {
                this.plumesNew[i][j] -= this.ACSinkCoeff[i][j] * this.dt * this.plumes[i][j];
                if (this.plumesNew[i][j] < params.PLUMEMIN)
                    this.plumesNew[i][j] = 0;
                this.plumesIntegrated[i][j] += this.plumesNew[i][j]
            }
        }
        this.plumes = this.plumesNew;
    }

    addPlume(plumeDuration) {
        let plumePosx = randRange(1, this.Lx - 1, this.randomGen);
        let plumePosy = randRange(1, thi.Ly - 1, this.randomGen);
        while (this.blocked[plumePosx][plumePosy] == 1 || this.plumes[plumePosx][plumePosy] > 0) {
            plumePosx = randRange(1, this.Lx - 1, this.randomGen);
            plumePosy = randRange(1, thi.Ly - 1, this.randomGen);
        }
        this.plumes[plumePosx][plumePosy] = plumeDuration;
        return [plumePosx, plumePosy];
    }

    initStaticPlumeField(nPlumes) {
        for (let i = 0; i < nPlumes; i++) {
            this.addPlume(1);
        }
    }

    getCoordFromIndex(idx) {
        return [Math.floor(idx / this.Lx), idx % this.Lx];
    }

    getIndexFromCoord(coord) {
        return coord[1] + this.Lx * coord[0];
    }

    getExit() {
        let exitInd = this.exitActive.indexOf(Math.min(...this.exitActive));
        console.log(this.exitActive)
        console.log("exit is: " + exitInd);
        this.exitActive[exitInd] += 1;
        let exit = this.exit[exitInd];
        return [parseInt(exit[0]), parseInt(exit[1])];
    }

    updateQueue(exitPos) {
        for (let i = 0; i < this.exit.length; i++) {
            if (this.exit[i][0] == exitPos[0] && this.exit[i][1] == exitPos[1]) {
                this.exitActive[i] -= 1;
                return;
            }
        }
    }

    createStaticGraph() {
		let totNodes = this.Lx * this.Ly
		this.graph = new Graph(totNodes);
        let blockedNodesList = [].concat.apply([], this.blocked);

        for (let i = 0; i < totNodes; i++) {
            if (blockedNodesList[i] == 0 && blockedNodesList[i+1] == 0 && this.graph.areConnected(i,i + 1) == false && (i + 1) % this.Lx != 0) {
                this.graph.addEdge(i, i + 1);
            }

            if (blockedNodesList[i] == 0 && blockedNodesList[i+this.Lx] == 0 && this.graph.areConnected(i,i + this.Lx) == false) {
                this.graph.addEdge(i, i + this.Lx);
            }
        }
    }

    initializeShelvesRegular(N, I = 2, J = 1, D = 2) {
        let placed = 0;
        let tries = 0;
        let II = I / this.dx;
        let JJ = J / this.dx;
        let DD = D / this.dx;

        let axis;
        let shelfSize;
        while (placed < N) {
            if (this.randomGen() < 0.5) {
                shelfSize = [II, JJ]
                axis = true;
            } else {
                shelfSize = [JJ, II];
                axis = false;
            }
            let shelfPosx = randRange(1, this.Lx - shelfSize[0] - 1, this.randomGen);
            let shelfPosy = randRange(1, this.Ly - shelfSize[1] - 1, this.randomGen);

            //while ((this.blocked.slice(shelfPosx, shelfPosx + shelfSize[0]).slice(shelfPosy, shelfPosy + shelfSize[1])).reduce((sum, e) => sum + e, 0)) {
            while (this.blocked.slice(shelfPosx, shelfPosx + shelfSize[0]).map(i => i.slice(shelfPosy, shelfPosy + shelfSize[1])).reduce((sum, e) => sum + e, 0) > 0) {
                shelfPosx = randRange(1, this.Lx + shelfSize[0] - 1, this.randomGen);
                shelfPosy = randRange(1, this.Ly - shelfSize[1] - 1, this.randomGen);
                tries += 1;
                if (tries > 1e4) {
                    //this.blockedShelves = [...this.blocked];
                    this.blockedShelves = this.blocked.map((a) => a.slice());
                    return placed;
                }
            }
            //this.blocked.slice(shelfPosx, shelfPosx + shelfSize[0]).slice(shelfPosy, shelfPosy + shelfSize[1]).fill(1);
            for (let i = shelfPosx; i < shelfPosx + shelfSize[0]; i++) {
                for (let j = shelfPosy; j < shelfPosy + shelfSize[1]; j++) {
                    // TODO, check this later, why is it sometimes smaller than 0
                    console.log(i, j)
                    if (i < 0 || j < 0) {
                        continue;
                    }
                    console.log("shelveserror", i)
                    this.blocked[i][j] = 1;
                }
            }
            //this.blocked.slice(shelfPosx, shelfPosx + shelfSize[0]).map(i => i.slice(shelfPosy, shelfPosy + shelfSize[1])).forEach((_, i) => {
            //    this[i] = 1;
            //});
            placed += 1;

            // TODO don't know if this is the right way to choose
            let direction = this.randomGen() > 0.5 ? 1 : -1;
            while (placed < N) {
                if (axis) {
                    shelfPosy += direction * (DD + JJ);
                } else {
                    shelfPosx += direction * (DD + II);
                }

                if (shelfPosx < 0 || shelfPosx >= this.Lx - shelfSize[0] - 1 || shelfPosy < 0 || shelfPosy >= this.Ly - shelfSize[1] - 1) {
                    break;
                }
                if (!(this.blocked.slice(shelfPosx, shelfPosx + shelfSize[0]).map(i => i.slice(shelfPosy, shelfPosy + shelfSize[1])).reduce((sum, e) => sum + e, 0) > 0)) {
                    //this.blocked.slice(shelfPosx, shelfPosx + shelfSize[0]).slice(shelfPosy, shelfPosy + shelfSize[1]).fill(1);
                    for (let i = shelfPosx; i < shelfPosx + shelfSize[0]; i++) {
                        for (let j = shelfPosy; j < shelfPosy + shelfSize[1]; j++) {
                            this.blocked[i][j] = 1;
                        }
                    }
                    placed += 1;
                } else {
                    break;
                }
            }
        }
        //this.blockedShelves = [...this.blocked];
        this.blockedShelves = this.blocked.map((a) => a.slice());
        return placed;
    }

    initializeDoors() {
        let entranceInd = this.getIndexFromCoord([params.ENTRANCEPOS, 0]);
        this.entrance = this.getCoordFromIndex(entranceInd);

        let i = params.EXITPOS;
        while (this.exit.length < params.NEXITS) {
            let exitInd = this.getIndexFromCoord([parseInt(this.Lx) - i, 0]);
            let checkPossiblePath = this.graph.shortestPath(entranceInd, exitInd);
            // TODO, check if this is actually correct, is there no path if this is true?
            while (checkPossiblePath.pop() != exitInd && this.Lx - i > 0) {
                i += 1;
                exitInd = this.getIndexFromCoord([this.Lx - i, 0]);
                checkPossiblePath = this.graph.shortestPath(entranceInd, exitInd);
            }
            this.exit.push(this.getCoordFromIndex(exitInd));
            i += params.CASHIERD;
        }
        console.log(this.exit)
        // TODO do we just pop off the last element here? they slice until last element
        //this.exit.pop();
    }
}

// Just a simple graph implementation for now
// let's make it undirected for now, so we can only create square stores for now
// TODO Sometimes errors in pathfinding, although the problem may be in the simulation itself
class Graph {
    constructor(n) {
        this.edges = new Array(n);
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i] = new Array();
        }
    }

    addEdge(source, target) {
        if (this.edges[source].includes(target)) {
            return;
        }
        this.edges[source].push(target);
        // adding reverse gives problems, but if we always search from low to high it shouldn't give problems
        this.edges[target].push(source);
    }

    areConnected(a, b) {
        return this.edges[a].includes(b);
    }

    shortestPath(source, target) {
        //console.log("called with: " + source + " " + target);
        if (source == target) {
            return [];
        }
        let visited = new Array(this.edges.length).fill(false);
        let queue = [];
        let pred = new Array(this.edges.length).fill(-1);
        queue.push(source);

        let currentNode;
        while (queue.length > 0) {
            currentNode = queue.shift();
            visited[currentNode] = true;
            for (let i = 0; i < this.edges[currentNode].length; i++) {
                if (!visited[this.edges[currentNode][i]]) {
                    visited[this.edges[currentNode][i]] = true;
                    queue.push(this.edges[currentNode][i]);
                    pred[this.edges[currentNode][i]] = currentNode;

                    if (this.edges[currentNode][i] == target) {
                        queue = [];
                        break;
                    }
                }
            }
        }
        let path = []
        path.push(target);
        let start = pred[target];
        while (true) {
            path.push(start);
            start = pred[start];
            if (start == -1) {
                break;
            }
        }
        //console.log("done");
        //console.log(path);
        return path.reverse();
    }
}

export {Store, Graph};
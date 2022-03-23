import {params, randRange} from './util.mjs'

class Store {
    constructor(Lx, Ly, dx) {
        this.Lx = Lx;
        this.Ly = Ly;
        this.dt = 1.0;
        this.dx = dx;
        this.dy = dx;
        //this.blocked = null
        this.blocked = new Array(this.Lx);
        for (let i = 0; i < this.blocked.length; i++) {
            this.blocked[i] = new Array(this.Ly).fill(0);
        }
        this.blockedShelves = null;
        this.invLxLy = 1.0 / (Lx * Ly);
        this.entrance = null;
        this.useDiffusion = null;
        this.exit = [];
        this.exitActive = new Array(params.NEXITS).fill(0);
        this.graph;

        // TODO check if we need all this, seems a bit useless to have it three times
        this.plumes = new Array(this.Lx);
        for (let i = 0; i < this.plumes.length; i++) {
            this.plumes[i] = new Array(this.Ly).fill(0);
        }
        this.plumesNew = new Array(this.Lx);
        for (let i = 0; i < this.plumesNew.length; i++) {
            this.plumesNew[i] = new Array(this.Ly).fill(0);
        }
        this.plumesIntegrated = new Array(this.Lx);
        for (let i = 0; i < this.plumesIntegrated.length; i++) {
            this.plumesIntegrated[i] = new Array(this.Ly).fill(0);
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

    // TODO
    // Think about how our system for the store is actually going to work
    // how precise do we want it to be... Do we use a grid system for the shelves or a more free
    // way of placing the shelves. Will impact the computations.
    // Of course the functionality for randomly placing doors and such we don't really need right now

    initializeExposureDuringTimeStep() {
        this.storeWideExposure = 0;
    }

    // TODO fix this. A lot of slicing involved. Only really for infection
    // get general sim working first
    updateDiffusion() {
        this.plumesNew = [...this.plumes];
    }

    addPlume(plumeDuration) {
        let plumePosx = randRange(1, this.Lx - 1);
        let plumePosy = randRange(1, thi.Ly - 1);
        while (this.blocked[plumePosx][plumePosy] == 1 || this.plumes[plumePosx][plumePosy] == 1) {
            plumePosx = randRange(1, this.Lx - 1);
            plumePosy = randRange(1, thi.Ly - 1);
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
        return [Math.floor(idx / this.Lx).toFixed(), idx % this.Lx];
    }

    getIndexFromCoord(coord) {
        return coord[1] + this.Lx * coord[0];
    }

    getExit() {
        //let exitInd = Math.min(this.exitActive);
        let exitInd = this.findMinExit(this.exitActive);
        console.log("exit is: " + exitInd);
        this.exitActive[exitInd] += 1;
        let exit = this.exit[exitInd];
        return [parseInt(exit[0]), parseInt(exit[1])];
    }

    findMinExit(exits) {
        let minIdx = 0;
        let min = exits[0][0] + exits[0][1];
        for (let i = 1; i < exits; i++) {
            let sum = exits[i][0] + exits[i][1];
            if (sum < min)
                min = sum;
                minIdx = i;
        }
        return minIdx;
    }

    updateQueue(exitPos) {
        for (let i = 0; i < this.exit.length; i++) {
            if (this.exit[i][0] == exitPos[0] && this.exit[i][1] == exitPos[1])
                this.exitActive[i] -= 1;
                break;
        }
        //this.exitActive[this.exit.find(exitPos)] -= 1;
    }

    createStaticGraph() {
		let totNodes = this.Lx * this.Ly
		this.graph = new Graph(totNodes);
        let blockedNodesList = [].concat.apply([], this.blocked);

        // connect all non-blocked spaces along x and y axis
        /*for (let i = 0; i < this.Ly; i++) {
            for (let j = 0; j < this.Lx; j++) {
                // connect along x
                if (this.blocked[j][i]==0 && this.blocked[j+1][i] == 0 && this.graph.areConnected(i * this.Lx + j,i * this.Lx + j + 1) == false) {
					this.graph.addEdge(i * this.Lx + j, i * this.Lx + j + 1);
                }
                // connect along y
                if (this.blocked[j][i]==0 && this.blocked[j][i + 1] == 0 && this.graph.areConnected(i * this.Lx + j,(i+1) * this.Lx + j) == false) {
                    this.graph.addEdge(i * this.Lx + j,(i+1) * this.Lx + j);
                }
            }
        }*/
        for (let i = 0; i < totNodes; i++) {
            if (blockedNodesList[i]==0 && blockedNodesList[i+1] == 0 && this.graph.areConnected(i,i + 1) == false && i + 1 % this.Lx != 0) {
                this.graph.addEdge(i, i + 1);
            }
        }

        for (let i = 0; i < totNodes; i++) {
            if (blockedNodesList[i]==0 && blockedNodesList[i+this.Lx] == 0 && this.graph.areConnected(i,i + this.Lx) == false) {
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
            if (Math.random() < 0.5) {
                shelfSize = [II, JJ]
                axis = true;
            } else {
                shelfSize = [JJ, II];
                axis = false;
            }
            let shelfPosx = randRange(1, this.Lx - shelfSize[0] - 1);
            let shelfPosy = randRange(1, this.Ly - shelfSize[1] - 1);

            //while ((this.blocked.slice(shelfPosx, shelfPosx + shelfSize[0]).slice(shelfPosy, shelfPosy + shelfSize[1])).reduce((sum, e) => sum + e, 0)) {
            while (this.blocked.slice(shelfPosx, shelfPosx + shelfSize[0]).map(i => i.slice(shelfPosy, shelfPosy + shelfSize[1])).reduce((sum, e) => sum + e, 0) > 0) {
                shelfPosx = randRange(1, this.Lx + shelfSize[0] - 1);
                shelfPosy = randRange(1, this.Ly - shelfSize[1] - 1);
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
                    this.blocked[i][j] = 1;
                }
            }
            //this.blocked.slice(shelfPosx, shelfPosx + shelfSize[0]).map(i => i.slice(shelfPosy, shelfPosy + shelfSize[1])).forEach((_, i) => {
            //    this[i] = 1;
            //});
            placed += 1;

            // TODO don't know if this is the right way to choose
            let direction = Math.random() > 0.5 ? 1 : -1;
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
        this.exit.pop();
    }
}

// Just a simple graph implementation for now
// let's make it undirected for now, so we can only create square stores for now
// TODO make it more flexible
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
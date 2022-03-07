import params from './util.mjs'
import { randRange } from './util.mjs';

class Store {
    constructor(Lx, Ly, dx) {
        this.Lx = Lx;
        this.Ly = Ly;
        this.dt = 1.0;
        this.dx = dx;
        this.dy = dx;
        this.blocked = null
        this.blockedShelves = null;
        this.invLxLy = 1.0 / (Lx * Ly);
        this.entrance = null;
        this.useDiffusion = null;
        this.exit = [];
        this.exitActive = new Array(params.NEXITS).fill(0);
        this.graph;

        // TODO check if we need all this, seems a bit useless to have it three times
        this.plumes = new Array(this.Lx).fill(new Array(this.Ly).fill(0));
        this.plumesNew = new Array(this.Lx).fill(new Array(this.Ly).fill(0));
        this.plumesIntegrated = new Array(this.Lx).fill(new Array(this.Ly).fill(0));
        this.diffusionCoeff = new Array(this.Lx).fill(new Array(this.Ly).fill(params.DIFFCOEFF));
        this.ACSinkCoeff = new Array(this.Lx).fill(new Array(this.Ly).fill(params.ACSINKCOEFF));
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

    updateDiffusion() {
        this.plumesNew = [...this.plumes];

    }

    addPlume(plumeDuration) {
        let plumePosx = Math.floor(randRange(1, this.Lx - 1));
        let plumePosy = Math.floor(randRange(1, thi.Ly - 1));
        while (this.blocked[plumePosx][plumePosy] || this.plumes[plumePosx][plumePosy]) {
            plumePosx = Math.floor(randRange(1, this.Lx - 1));
            plumePosy = Math.floor(randRange(1, thi.Ly - 1));
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
        exitInd = Math.min(this.exitActive);
        this.exitActive[exitInd] += 1;
        return this.exit[exitInd];
    }

    updateQueue(exitPos) {
        this.exitActive[this.exit.find(exitPos)] -= 1;
    }

    createStaticGraph() {
		let totNodes = this.Lx * this.Ly
		let blockedNodeList = np.asarray(self.blocked).reshape(-1)
		this.graph = new Graph(totNodes);

        // connect all non-blocked spaces along x and y axis
        for (let i = 0; i < this.Ly; i++) {
            for (let j = 0; j < this.Lx; j++) {
                // connect along x
                if (blockedNodeList[j][i]==0 && blockedNodeList[j+1][i] == 0 && this.graph.areConnected(i * this.Lx + j,i * this.Lx + j + 1) == False) {
					self.staticGraph.addEdge(i * this.Lx + j, i * this.Lx + j + 1);
                }
                // connect along y
                if (blockedNodeList[j][i]==0 && blockedNodeList[j][i + 1] == 0 && this.graph.areConnected(i * this.Lx + j,(i+1) * this.Lx + j) == False) {
                    self.staticGraph.addEdge(i * this.Lx + j,(i+1) * this.Lx + j);
                }
            }
        }
    }
}

// Just a simple graph implementation for now
// let's make it undirected for now, so we can only create square stores for now
// TODO make it more flexible
class Graph {
    constructor(n) {
        this.edges = new Array(n);
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i] = new Array(n).fill(false);
        }
    }

    addEdge(source, target) {
        if (this.edges[source][target]) {
            return;
        }
        this.edges[source][target] = true;
        // adding reverse gives problems, but if we always search from low to high it shouldn't give problems
        //this.edges[target][source] = true;
    }

    areConnected(a, b) {
        return this.edges[a][b];
    }

    shortestPath(source, target) {
        let visited = new Array(this.edges.length).fill(false);
        let queue = [];
        let pred = new Array(this.edges.length).fill(-1);
        queue.push(source);

        let currentNode;
        while (queue.length > 0) {
            currentNode = queue.shift();
            for (let i = 0; i < this.edges[currentNode].length; i++) {
                if (!this.edges[currentNode][i]) {
                    continue;
                }
                if (visited[i] == false) {
                    visited[i] = true;
                    queue.push(i);
                    pred[i] = currentNode;

                    if (i == target) {
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
        return path.reverse();
    }
}

export {Store, Graph};
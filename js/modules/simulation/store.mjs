import params from './params.mjs'

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
        // TODO again, the random number stuff
        let plumePosx;
        let plumePosy;
        //let plumePosx = Math.random...
        // let plumePosy = Math.random...
        while (this.blocked[plumePosx][plumePosy] || this.plumes[plumePosx][plumePosy]) {
            //plumePosx = Math.random...
            // plumePosy = Math.random...
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
}
import { params } from './util.mjs'
import SmartCustomer from './customer.mjs';
import { Store } from './store.mjs';
import { UPDATE_PRIORITY, Ticker, Container, Graphics } from '../pixi/pixi.mjs';

class Simulation {

    constructor(seed = 1, Lx, Ly, nShelves, nCustomers = 1, probNewCustomer = 0.1, probInfCustomer = 0.05,
        nPlumes = 20, maxSteps = 1000, useDiffusion = false, dx = 1.0, app, scale, vis) {

        // GRAPHICS
        this.app = app;
        this.stage = new Container();
        this.c_graphics = new Graphics();
        this.s_graphics = new Graphics();
        this.stage.addChild(this.c_graphics);
        this.stage.addChild(this.s_graphics);
        this.scale = scale;
        this.app.render(this.stage);
        this.ticker = new Ticker();

        // VISUALISATIONS
        this.vis = vis;

        // PARAMETERS
        this.seed = seed;
        // alea is the faster pseudorandom generator from seedrandom.js
        this.randomGen = new alea(this.seed);
        this.maxSteps = maxSteps;
        this.useDiffusion = useDiffusion;
        this.nCustomers = nCustomers;
        this.probNewCustomer = probNewCustomer;
        this.probInfCustomer = probInfCustomer;
        this.nPlumes = nPlumes;
        this.Lx = Lx;
        this.Ly = Ly;
        this.dx = dx;
        this.nShelves = nShelves;

        // original map before customers so we can re-render store
        // without customers becoming shelves
        this.selectedStore = null;
    }

    // initializes the state. Can be used to reinitialize after constructor parameters
    // changed
    initState() {
        // SIM STATE
        this.customerNow = 0;
        this.currentStep = 0;
        this.infectedCount = 0;
        this.customers = [];

        this.paused = false;

        if (this.nCustomers == 1) {
            this.probInfCustomer = -1;
            this.updatePlumes = false;

            // TODO: Look at what this is and if we need it?
            this.store.initStaticPlumeField(this.nPlumes);
        }
        else {
            this.updatePlumes = true;
        }

        if (this.useDiffusion) {
            this.store.useDiffusion = true;
        } else {
            this.store.useDiffusion = false;
        }

        this.exposureHist = new Array(this.nCustomers).fill(0);
        this.exposureHistTime = new Array(this.nCustomers).fill(0);
        this.exposureHistTimeThres = new Array(this.nCustomers).fill(0);
        this.itemsBought = new Array(this.nCustomers).fill(0);
        this.timeSpent = new Array(this.nCustomers).fill(0);
        this.customerInfected = new Array(this.nCustomers).fill(0);
        this.customersNowInStore = new Array(this.maxSteps).fill(0);
        this.emittingCustomersNowInStore = new Array(this.maxSteps).fill(0);
        this.customersNowInQueue = new Array(this.maxSteps).fill(0);
        this.exposureDuringTimeStep = new Array(this.maxSteps).fill(0);

        this.infectedCount = 0;

        this.customers = [];
    }

    // Generates a new customer
    newCustomer() {
        this.nCustomers -= 1;

        let infected = 0;
        let rand = this.randomGen();
        rand < this.probInfCustomer ? infected = 1 : infected = 0;
        let newCustomer = new SmartCustomer(this.store.entrance[0], this.store.entrance[1], infected, params.PROBSPREADPLUME);
        newCustomer.initShoppingList(this.store, params.MAXSHOPPINGLIST);
        this.customers.push(newCustomer);
        return this.customers.length;
    }

    // Renders the store itself, should only be done once
    renderStore() {
        this.s_graphics.clear();
        for (let i = 0; i < this.store.blocked.length; i++) {
            for (let j = 0; j < this.store.blocked[i].length; j++) {
                if (this.store.blockedShelves[i][j] == 1) {
                    this.s_graphics.beginFill(0x1c1f1d);
                    this.s_graphics.drawRect(this.scale * i, this.scale * j, this.scale, this.scale);
                    this.s_graphics.endFill();
                }
            }
        }
        // render 
        for (let i = 0; i < this.store.exit.length; i++) {
            this.s_graphics.beginFill(0x9a53fc);
            this.s_graphics.drawRect(this.scale * this.store.exit[i][0], this.scale * this.store.exit[i][1], this.scale, this.scale);
            this.s_graphics.endFill();
        }
        this.s_graphics.beginFill(0x9ad94e);
        this.s_graphics.drawRect(this.scale * this.store.entrance[0], this.scale * this.store.entrance[1], this.scale, this.scale);
        this.s_graphics.endFill();
        this.app.render(this.stage);
    }

    // Generate a store based on the algorithm from the paper
    genStore() {
        this.c_graphics.clear()
        this.store = new Store(1.0, this.randomGen);
        this.store.genMap(this.Lx, this.Ly, this.nShelves);
        //this.store.initializeShelvesRegular(this.nShelves);
        this.scale = this.app.width / this.Lx;
        this.store.createStaticGraph();
        this.store.initializeDoors();
    }

    // loads a store from the editor
    loadStore(mapObject) {
        this.c_graphics.clear()
        this.store = new Store(1.0, this.randomGen);
        this.store.loadMap(mapObject);
        this.store.createStaticGraph();
    }

    renderCustomers() {
        let infected = 0;
        this.c_graphics.clear();
        for (let c = 0; c < this.customers.length; c++) {
            if (this.customers[c].infected > 0) {
                this.c_graphics.beginFill(0xDE3249);
                infected++;
            } else {
                this.c_graphics.beginFill(0xFFFF00);
            }
            //this.graphics.beginFill(0xDE3249);
            this.c_graphics.drawRect(this.scale * parseInt(this.customers[c].x), this.scale * parseInt(this.customers[c].y), this.scale, this.scale);
            this.c_graphics.endFill();
        }
        if (infected != this.infectedCount)
            this.infectedCount = infected;
        this.app.render(this.stage);
    }

    // start the sim, mostly initializing final variables needed before execution
    // and start ticker for render loop
    startSim() {
        this.newCustomer();
        this.stepStr = "";
        this.customersHeadExit = 0;
        this.emittingCustomers = 0;
        this.maxQueue = params.WEIRDQUEUELIMIT;

        function tickUpdate() {
            if (!this.hasEnded()) {
                this.simStep();
                this.renderCustomers();
            } else {
                this.ticker.destroy();
                this.ticker = new Ticker();
            }
        }

        this.ticker.add(tickUpdate.bind(this), UPDATE_PRIORITY.HIGH);
        this.ticker.start();

        // vis code
        this.vis.moveData();
    }

    stopSim() {
        if (this.ticker != undefined) {
            this.ticker.stop();
            this.ticker.destroy();
        }
        this.ticker = new Ticker();
    }

    pauseSim() {
        if (this.paused) {
            this.paused = false;
            this.ticker.start();
        } else {
            this.paused = true;
            this.ticker.stop();
        }
    }

    hasEnded() {
        return this.currentStep == this.maxSteps;
    }

    // Takes one step in the simulation
    // using this in the render loop allows us to update the sim according to screen
    // refresh rate
    simStep() {
        this.customersNowInStore[this.currentStep] = this.customers.length;
        this.customersNowInQueue[this.currentStep] = this.customersHeadExit;
        this.emittingCustomersNowInStore[this.currentStep] = this.emittingCustomers

        this.exposureDuringTimeStep[this.currentStep] = this.store.storeWideExposure


        this.emittingCustomers = 0
        this.store.initializeExposureDuringTimeStep()
        this.currentStep++;
        if (this.customersHeadExit > this.maxQueue)
            this.maxQueue = this.customersHeadExit

        let customersExit = [];
        this.customersHeadExit = 0;

        this.customers.forEach((c, j) => {
            if (c.infected) {
                this.emittingCustomers++;
            }

            let [tx, ty] = c.takeStep(this.store)
            this.customersHeadExit += c.headingForExit;
            if (tx == -1 && ty == -1) {
                customersExit.push(j);
            }
        });

        for (let j = customersExit.length - 1; j >= 0; j--) {
            // we loop in reverse so we can remove indexes without problems
            let leavingCustomer = this.customers.splice(customersExit[j], 1)[0];
            this.store.updateQueue([leavingCustomer.x, leavingCustomer.y]);
            let [ti, tx, ty, tz, tw, twt] = leavingCustomer.getFinalStats();
            this.stepStr = `step ${this.currentStep} (${this.customers.length} customers, ${this.customersHeadExit} for exit): customer 
                    ${ti} left with ${tx} on shopping list, ${ty} total time in store, ${tz} exposure`;
            this.exposureHist[this.customerNow] = tz;
            this.exposureHistTime[this.customerNow] = tw;
            this.exposureHistTimeThres[this.customerNow] = twt;
            this.itemsBought[this.customerNow] = tx;
            this.timeSpent[this.customerNow] = tx;
            this.customerInfected[this.customerNow] = ty;
            this.customerNow += 1;
            console.log(this.stepStr);

        }

        if (this.updatePlumes && !this.useDiffusion) {
            this.store.plumes.forEach((e, i) => {
                if (e > 0)
                    this.store.plumes[i] -= 1;
            });
            if (this.nCustomers > 0 && this.randomGen() < this.probNewCustomer)
                this.newCustomer();
        } else if (this.updatePlumes && this.useDiffusion) {
            this.store.updateDiffusion();
            if (this.nCustomers && this.randomGen() < this.probNewCustomer)
                this.newCustomer();
        }
        // visualisation code
        if (this.currentStep % 10 === 0)
            this.vis.frameUpdate(this.infectedCount, this.currentStep);

        if (this.nCustomers == 0 && this.customers.length == 0) {
            // end condition, do whatever we want?
            // stop sim and update vis
            this.stopSim();
            return;
        }
    }

    getStats() {
        return {
            infections: this.infectedCount,
            step: this.currentStep,
            custCount: this.customers.length,
            totExposure: this.exposureDuringTimeStep[this.currentStep]
        }
    }
}

export default Simulation;
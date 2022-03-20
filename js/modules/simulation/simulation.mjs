import {params} from './util.mjs'
import SmartCustomer from './customer.mjs';
import { Store } from './store.mjs';
import { UPDATE_PRIORITY ,Ticker, Container, Graphics } from '../pixi/pixi.mjs';

class Simulation {

    constructor(seed, Lx, Ly, nShelves, nCustomers = 1, probNewCustomer = 0.1, probInfCustomer = 0.05,
        nPlumes = 20, maxSteps = 1000, useDiffusion = false, dx = 1.0, genStore = false, app, scale) {
        // Apparently javascript random does not accept a seed
        // So for this we need to find something or implement it ourselves
        this.seed = seed;
        this.maxSteps = maxSteps;

        // we will use this for now to stop the ticker eventually
        this.ticker;

        this.stepNow = 0;
        this.customerNow = 0;
        this.app = app;
        this.stage = new Container();
        this.graphics = new Graphics();
        this.graphics2 = new Graphics();
        this.graphics.x = 0;
        this.graphics.y = 0;
        this.stage.addChild(this.graphics);
        this.stage.addChild(this.graphics2);
        this.scale = scale;
        this.app.render(this.stage);
        this.currentStep = 0;

        this.useDiffusion = useDiffusion;
        this.store = new Store(Lx, Ly, dx);
        if (genStore) {
            this.store.initializeShelvesRegular(nShelves);
        } else {
            // load some store defined somewhere
        }
        this.store.createStaticGraph();
        this.store.initializeDoors();

        // init customer info
        this.probNewCustomer = probNewCustomer;
        this.nCustomers = nCustomers;
        this.exposureHist = new Array(this.nCustomers).fill(0);
		this.exposureHistTime = new Array(this.nCustomers).fill(0);
		this.exposureHistTimeThres = new Array(this.nCustomers).fill(0);
		this.itemsBought = new Array(this.nCustomers).fill(0) ;
		this.timeSpent = new Array(this.nCustomers).fill(0) ;
		this.customerInfected = new Array(this.nCustomers).fill(0) ;
		this.customersNowInStore = new Array(this.maxSteps).fill(0);
		this.emittingCustomersNowInStore = new Array(this.maxSteps).fill(0);
		this.customersNowInQueue = new Array(this.maxSteps).fill(0);
		this.exposureDuringTimeStep = new Array(this.maxSteps).fill(0);

        this.infectedCount = 0;

        if (this.nCustomers == 1) {
			this.probInfCustomer = -1
			this.updatePlumes = false

            // TODO: Look at what this is and if we need it?
			this.store.initStaticPlumeField(nPlumes)
        }
		else {
			this.probInfCustomer = probInfCustomer
			this.updatePlumes=true
        }

        if (this.useDiffusion) {
            this.store.useDiffusion = true;
        } else {
            this.store.useDiffusion = false;
        }

        this.customers = [];
    }

    newCustomer() {
        this.nCustomers -= 1;

        let infected = 0;
        let rand = Math.random();
        rand < this.probInfCustomer ? infected = 1 : infected = 0;
        let newCustomer = new SmartCustomer(this.store.entrance[0], this.store.entrance[1], infected, params.PROBSPREADPLUME);
        newCustomer.initShoppingList(this.store, params.MAXSHOPPINGLIST);
        this.customers.push(newCustomer);
        return this.customers.length;
    }

    renderStore() {
        for (let i = 0; i < this.store.blocked.length; i++) {
            for (let j = 0; j < this.store.blocked[i].length; j++) {
                if (this.store.blocked[i][j] == 1) {
                this.graphics2.beginFill(0x1c1f1d);
                this.graphics2.drawRect(this.scale * i, this.scale * j, this.scale, this.scale);
                this.graphics2.endFill();
            }
        }
        }
        for (let i = 0; i < this.store.exit.length; i++) {
            this.graphics2.beginFill(0x9a53fc);
            this.graphics2.drawRect(this.scale * this.store.exit[i][0], this.scale * this.store.exit[i][1], this.scale, this.scale);
            this.graphics2.endFill();
        }
        this.app.render(this.stage);
    }

    renderCustomers() {
        let infected = 0;
        this.graphics.clear();
        for (let c = 0; c < this.customers.length; c++) {
            if (this.customers[c].infected > 0) {
                this.graphics.beginFill(0xDE3249);
                infected++;
            } else {
                this.graphics.beginFill(0xFFFF00);
            }
            //this.graphics.beginFill(0xDE3249);
            this.graphics.drawRect(this.scale * parseInt(this.customers[c].x), this.scale * parseInt(this.customers[c].y), this.scale, this.scale);
            this.graphics.endFill();
        }
        if (infected != this.infectedCount)
            this.infectedCount = infected;
        this.app.render(this.stage);
    }

    startSim() {
        this.newCustomer();
        this.stepStr = "";
        this.customersHeadExit = 0;
        this.emittingCustomers = 0;
        this.maxQueue = params.WEIRDQUEUELIMIT;
    }

    hasEnded() {
        return this.currentStep == this.maxSteps;
    }

    simStep() {
        console.log("Step: " + this.currentStep);
            console.log("customers: " + this.customers.length);

            this.customersNowInStore[this.stepNow] = this.customers.length;
            this.customersNowInQueue[this.stepNow] = this.customersHeadExit;
			this.emittingCustomersNowInStore[this.stepNow] = this.emittingCustomers

			this.exposureDuringTimeStep[this.stepNow] = this.store.storeWideExposure


			this.emittingCustomers = 0
			this.store.initializeExposureDuringTimeStep()

            this.stepNow += 1
			if (this.customersHeadExit>this.maxQueue)
				this.maxQueue = customersHeadExit

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

            console.log("custexit: " + customersExit.length);
            // TODO review this later, unsure if it is right
            // for some reason we stop before the last element?
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
                this.store.plumes[this.store.plumes>0]-=1;
				if (this.nCustomers > 0 && Math.random() < this.probNewCustomer) 
                    this.newCustomer();
            } else if (this.updatePlumes && this.useDiffusion) {
                this.store.updateDiffusion();
				if (this.nCustomers && Math.random() < this.probNewCustomer)
                    this.newCustomer();
            }
            if (this.nCustomers == 0 && this.customers.length == 0) {
                // end condition, do whatever we want?
                return;
            }
            this.currentStep++;
    }

    getStats() {
        return {
            infections: this.infectedCount,
            step : this.currentStep,
            custCount : this.customers.length,
            totExposure : this.exposureDuringTimeStep[this.currentStep]
        }
    }

    restart() {
        this.customers = []
        this.probNewCustomer = probNewCustomer;
        this.nCustomers = nCustomers;
        this.exposureHist = new Array(this.nCustomers).fill(0);
		this.exposureHistTime = new Array(this.nCustomers).fill(0);
		this.exposureHistTimeThres = new Array(this.nCustomers).fill(0);
		this.itemsBought = new Array(this.nCustomers).fill(0) ;
		this.timeSpent = new Array(this.nCustomers).fill(0) ;
		this.customerInfected = new Array(this.nCustomers).fill(0) ;
		this.customersNowInStore = new Array(this.maxSteps).fill(0);
		this.emittingCustomersNowInStore = new Array(this.maxSteps).fill(0);
		this.customersNowInQueue = new Array(this.maxSteps).fill(0);
		this.exposureDuringTimeStep = new Array(this.maxSteps).fill(0);
    }
}

export default Simulation;
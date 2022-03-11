import {params} from './util.mjs'
import SmartCustomer from './customer.mjs';
import { Store } from './store.mjs';

class Simulation {

    constructor(seed, Lx, Ly, nShelves, nCustomers = 1, probNewCustomer = 0.1, probInfCustomer = 0.05,
        nPlumes = 20, maxSteps = 1000, useDiffusion = false, dx = 1.0, genStore = false) {
        // Apparently javascript random does not accept a seed
        // So for this we need to find something or implement it ourselves
        this.seed = seed;
        this.maxSteps = maxSteps;

        this.stepNow = 0;
        this.customerNow = 0;

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

        if (this.nCustomers == 1) {
			this.probInfCustomer = -1
			this.updatePlumes = false

            // TODO: Look at what this is and if we need it?
			//this.store.initStaticPlumeField(nPlumes)
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
        console.log("does this run?")
        this.nCustomers -= 1;

        let infected = 0;
        Math.random() < this.probInfCustomer ? infected = 1 : infected = 0;

        let newCustomer = new SmartCustomer(this.store.entrance[0], this.store.entrance[1], infected, params.PROBSPREADPLUME);
        newCustomer.initShoppingList(this.store, params.MAXSHOPPINGLIST);
        this.customers.push(newCustomer);
        console.log("reached here");
        return this.customers.length;
    }

    // This needs to be different for us. Porbably best to give a simulation
    // a canvas object to draw on
    printStore() {

    }

    // Not very useful yet, but probably if we want to give statistics
    // after sim end
    printEndStatistics() {

    }

    runSimulation() {
        this.newCustomer();
        let stepStr = "";
        let customersHeadExit = 0;
        let emittingCustomers = 0;
        let maxQueue = params.WEIRDQUEUELIMIT;
        

        for (let i = 0; i < this.maxSteps; i++) {
            console.log("Step: " + i);
            console.log("customers: " + this.customers.length);
            this.customersNowInStore[this.stepNow] = this.customers.length;
            this.customersNowInQueue[this.stepNow] = customersHeadExit;
			this.emittingCustomersNowInStore[this.stepNow] = emittingCustomers

			this.exposureDuringTimeStep[this.stepNow] = this.store.storeWideExposure


			emittingCustomers = 0
			this.store.initializeExposureDuringTimeStep()

            this.stepNow += 1
			if (customersHeadExit>maxQueue)
				maxQueue = customersHeadExit

			let customersExit = [];
			customersHeadExit = 0;

            this.customers.forEach((c, j) => {
                if (c.infected) {
                    emittingCustomers++;
                }
                
                let [tx, ty] = c.takeStep(this.store)
                customersHeadExit += c.headingForExit;
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
                stepStr = `step ${i} (${this.customers.length} customers, ${customersHeadExit} for exit): customer 
                    ${ti} left with ${tx} on shopping list, ${ty} total time in store, ${tz} exposure`;
                this.exposureHist[this.customerNow] = tz;
                this.exposureHistTime[this.customerNow] = tw;
                this.exposureHistTimeThres[this.customerNow] = twt;
                this.itemsBought[this.customerNow] = tx;
                this.timeSpent[this.customerNow] = tx;
                this.customerInfected[this.customerNow] = ty;
                this.customerNow += 1;
                console.log(stepStr);

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

            // TODO visualize simulation every iteration

            if (this.nCustomers == 0 && this.customers.length == 0) {
                // end condition, do whatever we want?
                return;
            }
        }

        // reached step limit, do ending things
        console.log("Reached last step")
    }
}

export default Simulation;
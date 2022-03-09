import params from './util.mjs'
import { SmartCustomer } from './customer.mjs';

class Simulation {

    constructor(seed, maxSteps, probNewCustomer) {
        // Apparently javascript random does not accept a seed
        // So for this we need to find something or implement it ourselves
        this.seed = seed;
        this.maxSteps = maxSteps;

        this.stepNow = 0;
        this.customerNow = 0;

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

        this.randomGenerator = new Math.seedrandom();

        if (this.nCustomers == 1) {
			this.probInfCustomer = -1
			this.updatePlumes = 0

            // TODO: Look at what this is and if we need it?
			//this.store.initStaticPlumeField(nPlumes)
        }
		else {
			this.probInfCustomer = probInfCustomer
			this.updatePlumes=1
        }

        this.customers = [];
    }

    newCustomer() {
        this.nCustomers -= 1;

        let infected = 0;
        Math.random() < this.probInfCustomer ? infected = 1 : infected = 0;

        let newCustomer = new SmartCustomer();
        newCustomer.initShoppingList(this.store, params.MAXSHOPPINGLIST);
        this.customers.push(newCustomer);
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

        for (i = 0; i < this.maxSteps; i++) {
            this.customersNowInStore[this.stepNow] = this.customers.length;
            this.customersNowInQueue[this.stepNow] = customersHeadExit
			this.emittingCustomersNowInStore[this.stepNow] = emittingCustomers

			this.exposureDuringTimeStep[this.stepNow] = this.store.storeWideExposure


			let emittingCustomers = 0
			this.store.initializeExposureDuringTimeStep()

            this.stepNow+=1
			if (customersHeadExit>maxQueue)
				maxQueue = customersHeadExit

			let customersExit = [];
			let customersHeadExit = 0;

            this.customers.forEach((c, j) => {
                if (c.infected)
                    emittingCustomers++;
                
                    let [tx, ty] = c.takeStep(this.store)
                    customersHeadExit += c.headingForExit;
                    if (tx == -1 && ty == -1)
                        customersExit.push(j);
            });

            // TODO review this later, unsure if it is right
            // for some reason we stop before the last element?
            for (let j = 0; j < customersExit.length - 1; j++) {
                let leavingCustomer = this.customers.splice(leavingCustomer[j], 1);
                this.store.updateQueue([leavingCustomer.x, leavingCustomer.y]);
                let [ti, tx, ty, tz, tw, twt] = leavingCustomer.getFinalStats();
                let stepStr = `step ${i} (${this.customers.length} customers, ${customersHeadExit} for exit): customer 
                    ${ti} left with ${rx} on shopping list, ${ty} total time in store, ${tz} exposure`;
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
                        this[i] -= 1; 
                });
                this.store.plumes[self.store.plumes>0]-=1;
				if (this.nCustomers.length > 0 && Math.random() < this.probNewCustomer) 
                    this.newCustomer();
            } else if (this.updatePlumes && this.useDiffusion) {
                this.store.updateDiffusion();
				if (this.nCustomers && Math.random() < this.probNewCustomer)
                    this.newCustomer();
            }

            // TODO visualize simulation every iteration

            if (!this.nCustomers && this.customers.length == 0) {
                // end condition, do whatever we want?
                return;
            }
        }

        // reached step limit, do ending things
        console.log("Reached last step")
    }
}

export default Simulation;
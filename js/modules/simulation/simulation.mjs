import params from './params.mjs'

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
        // TODO: Fix random here
        Math.random() < this.probInfCustomer ? infected = 1 : infected = 0;

        // TODO Create a new customer with shopping list
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

            // TODO store not defined yet
			this.exposureDuringTimeStep[this.stepNow] = this.store.storeWideExposure


			let emittingCustomers = 0
			//this.store.initializeExposureDuringTimeStep()

            this.stepNow+=1
			if (customersHeadExit>maxQueue)
				maxQueue = customersHeadExit

			let customersExit = [];
			let customersHeadExit = 0;

            this.customers.forEach((c, j) => {
                if (c.infected)
                    emittingCustomers++;
                
                    // let tx, ty = c.takeStep(this.store)
                    customersHeadExit += c.headingForExit;
                    if (tx == -1 && ty == -1)
                        customersExit.push(j);
            });

            // TODO add customersexit bit

            if (this.updatePlumes && !this.useDiffusion) {
                //self.store.plumes[self.store.plumes>0]-=1	
				//if self.nCustomers and np.random.rand()<self.probNewCustomer:
				//	self.newCustomer()
            } else if (this.updatePlumes && this.useDiffusion) {
                //self.store.updateDiffusion()
				//if self.nCustomers and np.random.rand()<self.probNewCustomer:
				//	self.newCustomer()	
            }

            // TODO visualize simulation every iteration

            if (!this.nCustomers && this.customers.length == 0) {
                // end condition, do whatever we want?
                return;
            }
        }

        // reached step limit, do ending things
    }
}

export default Simulation;
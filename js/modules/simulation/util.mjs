let params = {
    // some params related to the exits
    NEXITS : 3, 
    CASHIERD : 2, 
    ENTRANCEPOS : 0,
    EXITPOS : 1,

    // diffusion coeffs
    DIFFCOEFF : 5e-2,
    ACSINKCOEFF: 1e-2,
    PLUMEMIN:0.0,

    // plume spreading parameters
    PLUMELIFETIME : 20,
    PLUMECONCINC : 40000.0,
    PLUMECONCCONT : 5.0,
    PLUMEPLOTMIN : 1,

    CASHIERTIMEPERITEM : 1,
    BLOCKRANDOMSTEP: 0.8,
    PROBSPREADPLUME : 1./360,

    EXPOSURELIMIT : 1,
    // limits for maximum waiting time when a target from the shopping list is found
    MAXWAITINGTIME : 2,
    MINWAITINGTIME : 1,

    // some simulation parameters for the customer behaviour
    MAXSHOPPINGLIST : 20, 
    WEIRDQUEUELIMIT : 39,
}

export {params};

// Return a number between low (including) and high (excluding)
export function randRange(low, high, randomGen) {
    return Math.floor(randomGen() * (high - low) + low);
};

// Check whether a coordinate is in a 2D array of coordinates
export function checkCoordIn2DArray(x, y, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][0] == x && array[i][1] == y) {
            return true;
        }
    }
    return false;
};

// Randomly permute an array
export function permuteArray(array, randomGen) {
    let copy = [...array]
    let result = []
    while (copy.length > 0) {
        let index = randRange(0, copy.length, randomGen)
        result.push(copy[index]);
        copy.splice(index, 1);
    }
    return result;
}
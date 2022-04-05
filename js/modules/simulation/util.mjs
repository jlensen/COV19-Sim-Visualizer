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
export function randRange(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
};

export function checkCoordIn2DArray(x, y, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][0] == x && array[i][1] == y) {
            return true;
        }
    }
    return false;
};

export function permuteArray(array) {
    let copy = [...array]
    let result = []
    while (copy.length > 0) {
        let index = randRange(0, copy.length)
        result.push(copy[index]);
        copy.splice(index, 1);
    }
    return result;
}
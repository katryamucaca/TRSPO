const { parentPort } = require('worker_threads');

// calculate steps of one number
function getCollatzSteps(n) {
    let steps = 0;
    while (n > 1) {
        if (n % 2 === 0) {
            n = n / 2;
        } else {
            n = 3 * n + 1;
        }
        steps++;
    }
    return steps;
}

parentPort.on('message', (numbersChunk) => {
    let totalStepsInChunk = 0;
    
    for (let i = 0; i < numbersChunk.length; i++) {
        totalStepsInChunk += getCollatzSteps(numbersChunk[i]);
    }

    // return sum of steps
    parentPort.postMessage(totalStepsInChunk);
});
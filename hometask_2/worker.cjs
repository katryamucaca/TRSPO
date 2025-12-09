const { parentPort, workerData } = require('worker_threads');

const iterations = workerData;
let insideCircle = 0;

for (let i = 0; i < iterations; i++) {
    // generating x and y [-1, 1]
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;

    // check if all points are in the circle (x^2 + y^2 <= 1)
    if (x * x + y * y <= 1) {
        insideCircle++;
    }
}

// send results to the main thread
parentPort.postMessage(insideCircle);
import { parentPort, workerData } from 'worker_threads';

const limit = 100000;
let sum = 0;

for (let i = 0; i < limit; i++) {
  sum += i;
}

parentPort && parentPort.postMessage(`${workerData} thread result: ${sum}`);

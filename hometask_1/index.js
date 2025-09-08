
import { Worker } from 'worker_threads';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runWorker = (name) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(join(__dirname, 'worker.js'), { workerData: name });

    // getting the result at success
    worker.on('message', resolve);

    // rejecting promise at the error
    worker.on('error', reject);
  })
}

// start both workers parallelly
(async () => {
  const [result1, result2] = await Promise.all([
    runWorker('First'),
    runWorker('Second'),
  ])

  console.log(result1);
  console.log(result2);
})();
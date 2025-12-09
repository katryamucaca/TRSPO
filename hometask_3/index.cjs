const { Worker } = require('worker_threads');
const path = require('path');

const TOTAL_NUMBERS = 10_000_000;
const THREAD_COUNT = 8;
const CHUNK_SIZE = 50_000;

function runCollatzSimulation() {
    console.log(`Generating ${TOTAL_NUMBERS.toLocaleString()} numbers in Main Thread...`);
    
    // 1. generate data
    const numbers = new Int32Array(TOTAL_NUMBERS);
    for (let i = 0; i < TOTAL_NUMBERS; i++) {
        numbers[i] = i + 1;
    }

    // 2. prepare queues of tasks
    const tasks = [];
    for (let i = 0; i < TOTAL_NUMBERS; i += CHUNK_SIZE) {
        tasks.push({
            start: i,
            end: Math.min(i + CHUNK_SIZE, TOTAL_NUMBERS)
        });
    }

    console.log(`Tasks created: ${tasks.length} chunks. Starting processing with ${THREAD_COUNT} threads...`);

    return new Promise((resolve, reject) => {
        const start = performance.now();
        
        let globalTotalSteps = 0;
        let activeWorkers = 0;
        let tasksCompleted = 0;

        // start worker
        const startWorker = () => {
            const worker = new Worker(path.join(__dirname, 'worker.cjs'));
            activeWorkers++;

            // handle message from worker
            worker.on('message', (stepsSum) => {
                globalTotalSteps += stepsSum;
                tasksCompleted++;

                if (tasks.length > 0) {
                    const nextTask = tasks.shift();
                    const chunk = numbers.slice(nextTask.start, nextTask.end);
                    worker.postMessage(chunk);
                } else {
                    // finish worker
                    worker.terminate();
                    activeWorkers--;
                    
                    // if all workers are done
                    if (activeWorkers === 0) {
                        const end = performance.now();
                        resolve({
                            time: end - start,
                            totalSteps: globalTotalSteps,
                            avgSteps: globalTotalSteps / TOTAL_NUMBERS
                        });
                    }
                }
            });

            worker.on('error', reject);

            // give first task after creation
            if (tasks.length > 0) {
                const firstTask = tasks.shift();
                const chunk = numbers.slice(firstTask.start, firstTask.end);
                worker.postMessage(chunk);
            } else {
                worker.terminate();
                activeWorkers--;
            }
        };

        for (let i = 0; i < THREAD_COUNT; i++) {
            startWorker();
        }
    });
}

async function main() {
    try {
        const result = await runCollatzSimulation();
        
        console.log('\n--- REPORT ---');
        console.log(`Total Numbers: ${TOTAL_NUMBERS.toLocaleString()}`);
        console.log(`Threads used:  ${THREAD_COUNT}`);
        console.log(`Time elapsed:  ${(result.time / 1000).toFixed(3)} sec`);
        console.log(`Total Steps:   ${result.totalSteps.toLocaleString()}`);
        console.log(`AVERAGE Steps: ${result.avgSteps.toFixed(4)}`);
        console.log('--------------');
        
    } catch (err) {
        console.error('Simulation failed:', err);
    }
}

main();
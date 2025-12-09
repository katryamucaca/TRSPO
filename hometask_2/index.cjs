const { Worker } = require('worker_threads');
const path = require('path');

const TOTAL_POINTS = 1_000_000;
const THREAD_COUNTS = [2, 4, 8, 16, 32, 64];

// singlethread calculations
function runSingleThread() {
    return new Promise((resolve) => {
        const start = performance.now();
        let inside = 0;
        for (let i = 0; i < TOTAL_POINTS; i++) {
            const x = Math.random() * 2 - 1;
            const y = Math.random() * 2 - 1;
            if (x * x + y * y <= 1) inside++;
        }
        const end = performance.now();
        const pi = (inside / TOTAL_POINTS) * 4;
        resolve({ time: end - start, pi });
    });
}

// multithread calculations
function runMultiThread(numThreads) {
    return new Promise((resolve, reject) => {
        const pointsPerThread = Math.floor(TOTAL_POINTS / numThreads);
        const workers = [];
        const start = performance.now();
        
        let totalInside = 0;

        for (let i = 0; i < numThreads; i++) {
            const iterations = (i === numThreads - 1) 
                ? pointsPerThread + (TOTAL_POINTS % numThreads) 
                : pointsPerThread;

            const worker = new Worker(path.join(__dirname, 'worker.cjs'), {
                workerData: iterations
            });

            const workerPromise = new Promise((res, rej) => {
                worker.on('message', (count) => {
                    totalInside += count;
                    res();
                });
                worker.on('error', rej);
                worker.on('exit', (code) => {
                    if (code !== 0) rej(new Error(`Worker stopped with exit code ${code}`));
                });
            });

            workers.push(workerPromise);
        }

        Promise.all(workers).then(() => {
            const end = performance.now();
            const pi = (totalInside / TOTAL_POINTS) * 4;
            resolve({ time: end - start, pi });
        }).catch(reject);
    });
}

// main function
async function main() {
    console.log(`Starting calculation on ${TOTAL_POINTS} points...\n`);
    const results = [];

    // 1. single Thread
    process.stdout.write('Running Single Thread... ');
    const singleResult = await runSingleThread();
    console.log(`Done. Time: ${singleResult.time.toFixed(2)}ms`);
    results.push({ threads: 1, time: singleResult.time, pi: singleResult.pi });

    // 2. parallel Threads
    for (const threads of THREAD_COUNTS) {
        process.stdout.write(`Running ${threads} Threads... `);
        const result = await runMultiThread(threads);
        console.log(`Done. Time: ${result.time.toFixed(2)}ms`);
        results.push({ threads, time: result.time, pi: result.pi });
    }

    generateReport(results);
}

function generateReport(results) {
    let report = ` Звіт обчислення числа PI (Monte Carlo)\n`;
    report += `Кількість точок: ${TOTAL_POINTS.toLocaleString()}\n`;
    report += `Середовище: Node.js ${process.version}\n\n`;
    report += `| Потоки | Час виконання (ms) | Обчислене PI |\n`;
    report += `| :--- | :--- | :--- |\n`;

    results.forEach(row => {
        report += `| ${row.threads} | ${row.time.toFixed(2)} | ${row.pi.toFixed(5)} |\n`;
    });

    const bestResult = results.reduce((prev, curr) => prev.time < curr.time ? prev : curr);
    
    report += `\n Висновки\n`;
    report += `- Найкращий час показав варіант з ${bestResult.threads} потоками (${bestResult.time.toFixed(2)}ms).\n`;
    

    console.log(report)
}

main();
const net = require('net');

const PORT = process.env.SERVER_PORT || 9000;

const getCollatzSteps = (n) => {
    let steps = 0;
    while (n !== 1) {
        if (n % 2 === 0) {
            n = n / 2;
        } else {
            n = 3 * n + 1;
        }
        steps++;
    }
    return steps;
}

const server = net.createServer((socket) => {
    console.log('Клієнт підключився');

    socket.on('data', (data) => {
        const inputStr = data.toString().trim();
        const N = parseInt(inputStr, 10);

        console.log(`Отримано N = ${N}. Починаю обчислення...`);

        let totalSteps = 0;
        for (let i = 1; i <= N; i++) {
            totalSteps += getCollatzSteps(i);
        }

        const averageSteps = totalSteps / N;
        const result = averageSteps.toFixed(4);

        console.log(`Результат: ${result}. Відправляю клієнту.`);
        socket.write(result);
    });

    socket.on('end', () => {
        console.log('Клієнт відключився');
    });

    socket.on('error', (err) => {
        console.error(`Помилка з'єднання: ${err.message}`);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`TCP Сервер запущено на порту ${PORT}`);
});
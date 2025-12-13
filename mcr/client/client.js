const net = require('net');

const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || 9000;
const COLLATZ_COUNT = process.env.COLLATZ_COUNT || '100';

console.log(`Налаштування: HOST=${SERVER_HOST}, PORT=${SERVER_PORT}, N=${COLLATZ_COUNT}`);

setTimeout(() => {
    const client = new net.Socket();

    client.connect(SERVER_PORT, SERVER_HOST, () => {
        console.log('Підключено до сервера!');
        client.write(COLLATZ_COUNT);
    });

    client.on('data', (data) => {
        console.log('-'.repeat(30));
        console.log(`СЕРЕДНЯ КІЛЬКІСТЬ КРОКІВ: ${data.toString()}`);
        console.log('-'.repeat(30));
        
        client.destroy();
    });

    client.on('close', () => {
        console.log("З'єднання закрито");
    });

    client.on('error', (err) => {
        console.error(`Помилка підключення: ${err.message}`);
    });
}, 2000);
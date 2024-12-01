const amqp = require('amqplib');
require('dotenv').config();

const { RMQ_HOST, RMQ_USERNAME, RMQ_PASSWORD, RMQ_VHOST } = process.env;
let channel = null;

async function initializeRabbitMQ() {
    const connection = await amqp.connect({
        hostname: RMQ_HOST,
        username: RMQ_USERNAME,
        password: RMQ_PASSWORD,
        vhost: RMQ_VHOST,
    });
    channel = await connection.createChannel();
    await channel.assertQueue('sor_parsed', { durable: true });
}

function sendToQueue(queue, message) {
    if (channel) {
        channel.sendToQueue(queue, Buffer.from(message));
        console.log(`Message sent to queue: ${queue}`);
    } else {
        console.error('RabbitMQ channel is not initialized.');
    }
}

module.exports = { initializeRabbitMQ, sendToQueue };

const amqp = require('amqplib');
require('dotenv').config();

const { RMQ_HOST, RMQ_USERNAME, RMQ_PASSWORD, RMQ_VHOST } = process.env;

async function consumeMessages(queue, processMessage) {
    const connection = await amqp.connect({
        hostname: RMQ_HOST,
        username: RMQ_USERNAME,
        password: RMQ_PASSWORD,
        vhost: RMQ_VHOST,
    });
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            const messageContent = msg.content.toString();
            await processMessage(JSON.parse(messageContent));
            channel.ack(msg);
        }
    });

    console.log(`Listening for messages on queue: ${queue}`);
}

module.exports = { consumeMessages };

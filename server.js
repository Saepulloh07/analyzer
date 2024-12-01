const { initializeRabbitMQ } = require('./producer');
const { pollMongoDB } = require('./monitor');

(async () => {
    console.log('Starting system...');
    await initializeRabbitMQ(); // Initialize RabbitMQ
    pollMongoDB(); // Start polling MongoDB for new documents
})();

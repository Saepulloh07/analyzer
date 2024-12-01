const { initializeRabbitMQ } = require('./producer');
const { pollMongoDB } = require('./src/monitor');

(async () => {
    console.log('Starting system...');
    await initializeRabbitMQ(); 
    pollMongoDB(); 
})();

const { MongoClient } = require('mongodb');
const { processDocument } = require('./helper');
require('dotenv').config();

const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

// Poll MongoDB for documents with `status: true`
async function pollMongoDB() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(MONGODB_DB_NAME);
        const collection = db.collection('files');
        const processedDocs = new Set();

        setInterval(async () => {
            try {
                const documentToProcess = await collection.findOne({
                    status: true,
                    guid: { $nin: Array.from(processedDocs) },
                });

                if (documentToProcess) {
                    console.log('Document ready to process:', documentToProcess);

                    // Update status to false before processing
                    await collection.updateOne(
                        { _id: documentToProcess._id },
                        { $set: { status: false } }
                    );

                    // Add the `guid` to the processedDocs set
                    processedDocs.add(documentToProcess.guid);

                    // Process the document
                    await processDocument(documentToProcess);

                    // Update status back to true after processing
                    await collection.updateOne(
                        { _id: documentToProcess._id },
                        { $set: { status: true } }
                    );

                    console.log(`Processed and updated document with guid: ${documentToProcess.guid}`);
                } else {
                    console.log('No documents ready to process.');
                }
            } catch (error) {
                console.error('Error polling MongoDB:', error);
            }
        }, 5000);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = { pollMongoDB };

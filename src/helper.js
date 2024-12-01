const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const {
    S3_ACCESS_KEY,
    S3_SECRET_KEY,
    S3_BUCKET_NAME,
    S3_REGION,
    S3_ENDPOINT,
    MONGODB_URI,
    MONGODB_DB_NAME
} = process.env;

// Initialize S3 client
const s3Client = new S3Client({
    region: S3_REGION,
    endpoint: `https://${S3_ENDPOINT}`,
    credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
    },
});

// Initialize MongoDB client
const mongoClient = new MongoClient(MONGODB_URI);

// Ensure MongoDB is connected
async function connectMongo() {
    if (!mongoClient.topology || !mongoClient.topology.isConnected()) {
        await mongoClient.connect();
    }
    return mongoClient.db(MONGODB_DB_NAME).collection('analyzer');
}

// Download file from S3
async function downloadFileFromS3(fileUrl) {
    let s3Key;
    try {
        const parsedUrl = new URL(fileUrl);
        s3Key = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));

        const fileName = path.basename(parsedUrl.pathname);
        const fileDir = path.join('./temp', 's3-files');
        const filePath = path.join(fileDir, fileName);

        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
        }

        const command = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: s3Key });
        const response = await s3Client.send(command);

        const fileStream = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
            response.Body.pipe(fileStream)
                .on('finish', resolve)
                .on('error', reject);
        });

        console.log(`File successfully downloaded to: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error(`Failed to download file from S3: ${error.message}`);
        throw error;
    }
}

// Parse SOR file using Python script
async function parseSorFile(filepath) {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, 'parse_sor.py');
        const pythonProcess = spawn('python', [pythonScript, filepath]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (chunk) => {
            outputData += chunk.toString();
        });

        pythonProcess.stderr.on('data', (chunk) => {
            errorData += chunk.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(errorData.trim()));
            }
            try {
                resolve(JSON.parse(outputData));
            } catch (err) {
                reject(new Error('Failed to parse JSON output from Python script.'));
            }
        });
    });
}

// Process a document
async function processDocument(newDocument) {
    try {
        if (!newDocument.file) {
            console.error('Invalid document: Missing file.');
            return;
        }

        // Download file from S3
        const filePath = await downloadFileFromS3(newDocument.file);

        // Parse SOR file
        const { results, tracedata } = await parseSorFile(filePath);
        const { KeyEvents, FxdParams } = results;

        // Parse events
        const events = [];
        if (KeyEvents && typeof KeyEvents === 'object') {
            for (let i = 1; i <= (KeyEvents['num events'] || 0); i++) {
                const event = KeyEvents[`event ${i}`];
                if (event) {
                    events.push({
                        event: i,
                        distance: parseFloat(event.distance || 0),
                        splice_loss: parseFloat(event['splice loss'] || 0),
                        refl_loss: parseFloat(event['refl loss'] || 0),
                        slope: parseFloat(event.slope || 0),
                        type: event.type || '',
                    });
                }
            }
        }

        const guid = uuidv4(); 

        // Prepare parsed data
        const parsedData = {
            guid : guid,
            file: newDocument.file,
            events,
            generalParams: FxdParams,
            traceData: tracedata,
            createdAt: new Date(),
        };

        // Save parsed data to MongoDB
        const analyzerCollection = await connectMongo();
        const result = await analyzerCollection.insertOne(parsedData);
        console.log(`Data saved to 'analyzer' collection with ID: ${result.insertedId}`);

        // Remove temporary file
        fs.unlinkSync(filePath);
        console.log(`Temporary file deleted: ${filePath}`);
    } catch (error) {
        console.error(`Error processing document:`, error);
    }
}

module.exports = { processDocument, downloadFileFromS3, parseSorFile };

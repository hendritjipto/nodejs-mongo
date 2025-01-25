import {
    MongoClient
} from 'mongodb';
import { faker } from "@faker-js/faker";

var connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
//var connection = "mongodb://root:example@localhost:27017,localhost:27018,localhost:27019,localhost:27020,localhost:27021/?replicaSet=mongo-replica&retryWrites=true&w=majority";
const dbName = 'Customer'; // Replace with your database name
const collectionName = 'scb'; // Replace with your collection name

async function generateAndStoreData() {
    try {
        console.log(process.env.ATLASSEARCHURI);
        const client = new MongoClient(connection);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const data = [];
        for (let i = 0; i < 10; i++) {
            // Generate a new document
            const data = {
                name: faker.person.fullName(),
                toddler_id: faker.number.int({ min: 10000, max: 99999 }),
            };

            try {
                // Insert the document and wait for 1 second before the next iteration
                await collection.insertOne(data);
            } catch (error) {
                console.error('[inside] Error inserting data:', error);
            }

            console.log('Data inserted successfully : ' + i);
            //await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('Data inserted successfully');
        await client.close();

    } catch (error) {
        console.error('Error inserting data:', error);
    }
}

generateAndStoreData();
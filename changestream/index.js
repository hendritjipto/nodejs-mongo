import {
    MongoClient
} from 'mongodb';


var connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
//var connection = "mongodb://root:example@localhost:27017,localhost:27018,localhost:27019,localhost:27020,localhost:27021/?replicaSet=mongo-replica&retryWrites=true&w=majority";
const dbName = 'Customer'; // Replace with your database name
const collectionName = 'changestream'; // Replace with your collection name


async function generateAndStoreData() {
    try {
        console.log(connection);
        const client = new MongoClient(connection);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        await collection.insertOne({ number: 5, name: "John Doe", age: 30 });

        await client.close();

    } catch (error) {
        console.error('Error inserting data:', error);
    }
}

generateAndStoreData();
import {
    MongoClient
} from 'mongodb';


var connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";
//var connection = "mongodb://root:example@localhost:27017,localhost:27018,localhost:27019,localhost:27020,localhost:27021/?replicaSet=mongo-replica&retryWrites=true&w=majority";
const dbName = 'Customer'; // Replace with your database name
const collectionName = 'cattransaction'; // Replace with your collection name

async function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAndStoreData() {
    const client = new MongoClient(connection);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);


    try {
        //console.log(connection);

        const result = await collection.findOneAndUpdate(
            { _id: 1 },
            { $inc: { transactionno: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        const newTransactionNo = result ? result.transactionno : null;

        // Pause for 2 seconds
        //await pause(30000);

        console.log('Transaction number:', newTransactionNo);


    } catch (error) {

        
        console.error('Transaction failed:', error);

    }
    finally {

        await client.close();
    }
}

generateAndStoreData();
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
    const session = client.startSession();

    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
      };

    try {
        //console.log(connection);

        await session.startTransaction(transactionOptions);

        const chatactive = await collection.findOneAndUpdate(
            { _id: 1 },
            { $inc: { transactionno: 1 } },
            { returnDocument: 'after', upsert: true, session }
        );
        const chatarchive = await collection.findOneAndUpdate(
            { _id: 1 },
            { $inc: { transactionno: 1 } },
            { returnDocument: 'after', upsert: true, session }
        );
        const newTransactionNo = result ? result.transactionno : null;

        // Pause for 2 seconds
        //await pause(30000);

        console.log('Transaction number:', newTransactionNo);

        await session.commitTransaction();

    } catch (error) {
        await session.abortTransaction();
        
        console.error('Transaction failed:', error);
        await pause(60000);
        generateAndStoreData(); /// MONGODB GA ADA DEADLOCK 
    }
    finally {
        await session.endSession();
        await client.close();
    }
}

generateAndStoreData();
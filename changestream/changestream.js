import { MongoClient } from 'mongodb';

const connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";  
const dbName = 'stream'; // Replace with your database name  
const collectionName = 'confluent'; // Replace with your collection name  

async function generateAndStoreData() {  
    let client;

    try {  
        console.log(connection);  
        client = new MongoClient(connection);  
        await client.connect();  
        const db = client.db(dbName);  
        const collection = db.collection(collectionName);  

        // Start the change stream
        const changeStream = await collection.watch();  

 

        changeStream.on('change', next => {  
            const resumeToken = changeStream.resumeToken; // Use the change event's _id as the resume token
            console.log(resumeToken);
            console.log('Change detected:', next);
            // Process the change event
            processChange(next);  

            // Optionally, you can close the change stream and create a new one with the resume token
            changeStream.close();  
            const newChangeStream = collection.watch([], { resumeAfter: resumeToken });  
            newChangeStream.on('change', next => {  
                processChange(next);  
            });  
        });  

    } catch (error) {  
        console.error('Error:', error);  
    } finally {
        // Ensure the client is closed when done
        // if (client) {
        //     await client.close();
        // }
    }  
}

function processChange(change) {
    // Implement your change processing logic here
    console.log('Processing change:', change);
}

generateAndStoreData();

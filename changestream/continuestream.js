import { MongoClient } from 'mongodb';

const connection = process.env.ATLASSEARCHURI + "?retryWrites=true&w=majority";  
const dbName = 'Customer'; // Replace with your database name  
const collectionName = 'changestream'; // Replace with your collection name  

async function generateAndStoreData() {  
    let client;

    try {  
        console.log(connection);  
        client = new MongoClient(connection);  
        await client.connect();  
        const db = client.db(dbName);  
        const collection = db.collection(collectionName);  

        const myToken = {
            _data: '8267340E3A000000012B042C0100296E5A10042DE01A5C841E4BC6881BF79AF88DEE3A463C6F7065726174696F6E54797065003C696E736572740046646F63756D656E744B65790046645F6964006467340E39C2DB00D9ADF24742000004'
          }

        // Start the change stream
        const changeStream = await collection.watch([], { resumeAfter: myToken });  

        changeStream.on('change', next => {  
            const resumeToken = changeStream.resumeToken; // Use the change event's _id as the resume token
            console.log(resumeToken);
            console.log('Change detected:', next);
            // Process the change event
            //processChange(next);  
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

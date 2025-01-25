var connection = process.env.ATLASSEARCHURI + "Customer";

import {
    mongoose
} from 'mongoose';


const { Schema } = mongoose;

// User Schema
const userSchema = new Schema({
    user_id: { type: String, required: true, unique: true },
    name: String,
    email: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Conversation Schema
const conversationSchema = new Schema({
    conversation_id: { type: String, required: true, unique: true },
    user_ids: [String], // Array of user IDs
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

// Chat Active Schema
const chatActiveSchema = new Schema({
    message_id: { type: String, required: true, unique: true },
    conversation_id: { type: String, required: true },
    sender_id: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    reply_id : String
});

const ChatActive = mongoose.model('ChatActive', chatActiveSchema);

// Chat Archive Schema
const chatArchiveSchema = new Schema({
    archive_id: { type: String, required: true, unique: true },
    conversation_id: { type: String, required: true },
    archived_messages: [
        {
            message_id: String,
            sender_id: String,
            message: String,
            timestamp: Date
        }
    ],
    last_message_timestamp: Date, // Timestamp of the last message in the archive
    archived_at: { type: Date, default: Date.now }
});

const ChatArchive = mongoose.model('ChatArchive', chatArchiveSchema);


async function populateData() {
    await mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true });

    // Add Users
    await User.create([
        { user_id: 'user_001', name: 'Alice', email: 'alice@example.com' },
        { user_id: 'user_002', name: 'Bob', email: 'bob@example.com' }
    ]);

    // Add a Conversation
    await Conversation.create({
        conversation_id: 'conv_001',
        user_ids: ['user_001', 'user_002']
    });

    // Add Chat Messages
    await ChatActive.create([
        { message_id: 'msg_001', conversation_id: 'conv_001', sender_id: 'user_001', message: 'Hello Bob!' },
        { message_id: 'msg_002', conversation_id: 'conv_001', sender_id: 'user_002', message: 'Hi Alice!' },
        { message_id: 'msg_003', conversation_id: 'conv_001', sender_id: 'user_001', message: 'How are you?' }
    ]);

    console.log('Data populated');
    mongoose.connection.close();
}

//populateData();

async function archiveChats() {
    await mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find messages older than 7 days
    const oldMessages = await ChatActive.find({ timestamp: { $lte: sevenDaysAgo } }).sort({ timestamp: 1 });

    const groupedByConversation = oldMessages.reduce((acc, msg) => {
        if (!acc[msg.conversation_id]) acc[msg.conversation_id] = [];
        acc[msg.conversation_id].push(msg);
        return acc;
    }, {});

    for (const [conversationId, messages] of Object.entries(groupedByConversation)) {
        let batch = [];
        for (const msg of messages) {
            batch.push(msg);

            // Archive when batch reaches 10 messages or the last message in the group
            if (batch.length === 10 || msg === messages[messages.length - 1]) {
                await ChatArchive.create({
                    archive_id: `arch_${conversationId}_${Date.now()}`,
                    conversation_id: conversationId,
                    archived_messages: batch.map(m => ({
                        message_id: m.message_id,
                        sender_id: m.sender_id,
                        message: m.message,
                        timestamp: m.timestamp
                    })),
                    last_message_timestamp: batch[batch.length - 1].timestamp
                });

                // Remove archived messages from ChatActive
                await ChatActive.deleteMany({ message_id: { $in: batch.map(m => m.message_id) } });
                batch = [];
            }
        }
    }

    console.log('Archiving complete');
    mongoose.connection.close();
}

//archiveChats();

async function populateOldChats() {
    await mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Backdated messages for archiving
    const oldMessages = [
        {
            message_id: "msg_004",
            conversation_id: "conv_001",
            sender_id: "user_001",
            message: "This is an old message from Alice.",
            timestamp: new Date(sevenDaysAgo.getTime() - 1000000) // Older than 7 days
        },
        {
            message_id: "msg_005",
            conversation_id: "conv_001",
            sender_id: "user_002",
            message: "This is an old message from Bob.",
            timestamp: new Date(sevenDaysAgo.getTime() - 500000) // Older than 7 days
        },
        {
            message_id: "msg_006",
            conversation_id: "conv_001",
            sender_id: "user_001",
            message: "Another old message from Alice.",
            timestamp: new Date(sevenDaysAgo.getTime() - 200000) // Older than 7 days
        }
    ];

    await ChatActive.insertMany(oldMessages);

    console.log('Old chats populated for archiving');
    mongoose.connection.close();
}

//populateOldChats();

async function populateOldChats2() {
    await mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true });

    const now = new Date();
    const eightDaysAgo = new Date(now);
    eightDaysAgo.setDate(now.getDate() - 8);

    // Generate 20 old chat messages
    const oldChats = Array.from({ length: 20 }, (_, i) => ({
        message_id: `msg_${i + 1}`,
        conversation_id: 'conv_001', // Assuming a single conversation for simplicity
        sender_id: i % 2 === 0 ? 'user_001' : 'user_002', // Alternate senders
        message: `Old message ${i + 1}`,
        timestamp: new Date(eightDaysAgo.getTime() + i * 60000) // 1-minute increments
    }));

    // Insert old chats into chat_active
    await ChatActive.insertMany(oldChats);

    console.log('20 old chats populated successfully');
    mongoose.connection.close();
}

//populateOldChats2();
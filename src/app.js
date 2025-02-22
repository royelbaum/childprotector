import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import {analyzeMessage} from "./OpenAiAnalyzer/Analyzer.js";

// Initialize WhatsApp client with session persistence
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session' }),
});

// Display QR code for first-time authentication
client.on('qr', (qr) => {
    console.log('Scan this QR Code to connect WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// When WhatsApp client is ready
client.on('ready', () => {
    console.log('✅ WhatsApp client is connected and ready!');
});



// Listen for incoming messages
client.on('message', async (message) => {
    try {
        const chat = await message.getChat();
        const sender = await message.getContact();

        // Process all messages (chat.isGroup check removed as requested)
        console.log(`📩 New message from chat "${chat.name}" by ${sender.name}:`);
        console.log(`💬 ${message.body}`);

        // Analyze the message with ChatGPT
        const moderationResult = await analyzeMessage(message.body);
        console.log(`🚨 Moderation Result: ${JSON.stringify(moderationResult)}`);

        // Log the message and result to a file
        const logMessage = `[CHAT: ${chat.name}] ${sender.pushname}: ${message.body} -> ${JSON.stringify(moderationResult)}\n`;
        fs.appendFileSync('messages.txt', logMessage);

        // Optionally send a warning message if the analysis flags the message
        if (moderationResult.status === 'alert') {
            await client.sendMessage(
                chat.id._serialized,
                `⚠️ Warning: A message was flagged as inappropriate.\nReason: ${moderationResult.reason}`
            );
        }
    } catch (error) {
        console.error('❌ Error processing message:', error);
    }
});

// Start the WhatsApp client
client.initialize();

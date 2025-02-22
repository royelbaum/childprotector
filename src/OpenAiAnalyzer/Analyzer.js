import  OpenAi from 'openai';
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to analyze a message using ChatGPT
export async function analyzeMessage(messageText) {
    const messages = [
        {
            role: 'system',
            content:
                "You are a child safety moderator specialized in detecting abusive language in school group chats. For any given message, output a JSON object with two keys: 'status' (either 'safe' or 'alert') and 'reason' (a brief explanation if the message is flagged).",
        },
        { role: 'user', content: messageText },
    ];

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            temperature: 0,
            response_format: { type: "json_object" },
        });
        const resultText = response.choices[0].message
        return JSON.parse(resultText.content);
    } catch (error) {
        console.error('❌ Error analyzing message:', error);
        return { status: 'unknown', reason: 'Error processing message.' };
    }
}

let ans1 = await analyzeMessage("היי כולם מה קורה?")
console.log(ans1)
let ans2 = await analyzeMessage("יובל אתה כזה מטומטם");
console.log(ans2)

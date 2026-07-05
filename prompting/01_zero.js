import {OpenAI} from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    const result = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: "tell me a story about a dog and a cat who become friends"
            }
        ]
    });

    console.log(`Answer from OpenAI API: ${result.choices[0].message.content}`);
}

main()

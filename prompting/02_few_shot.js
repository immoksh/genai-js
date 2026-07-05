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
                content: `What is 2 + 2?
                Don not add any explanation, just give the answer in words.
                Examples:
                - What is 1 + 1 equals?
                  Expected Output: 2 (Two)
                - What is 10 + 9 equals?
                  Expected Output: 19 (Nineteen)
                `
            }
        ]
    });

    console.log(`Answer from OpenAI API: ${result.choices[0].message.content}`);
}

main()

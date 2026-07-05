import {OpenAI} from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
        role: "user",
        content: "Hello, how are you?"
    }
  ]
}).then((completion) => {
  console.log(completion.choices[0].message.content);
})
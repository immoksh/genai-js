import OpenAI from "openai";
import 'dotenv/config'

const client = new OpenAI()

async function init() {
    const stream = await client.responses.create({
        model: "gpt-4.1-mini",
        stream: true,
        input: [{
            role: "user",
            content: "What is the purpose of AI."
        }]
    })

    for await(const event of stream) {
        if (event && event.delta)
            process.stdout.write(event.delta)
    }
}

init()
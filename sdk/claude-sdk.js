import Anthropic from "@anthropic-ai/sdk";
import 'dotenv/config'

const client = new Anthropic()

async function init() {
    const result = await client.messages.create({
        max_tokens: 1024,
        messages: [{
            "role": "user",
            "content": "Hello Claude"
        }],
        model: "claude-opus-4-8"
    })

    for (const block of result.content) {
        if (block.type === "text") {
            console.log(block.text)
        }
    }
}

init()
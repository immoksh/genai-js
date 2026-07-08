import OpenAI from "openai";
import 'dotenv/config'
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const client = new OpenAI()

const RiskSchema = z.object({
    title: z.string().describe('the actual title for risk'),
    tags: z.string().describe('3-4 tags for this risk'),
    score: z.number().min(1).max(5).describe('risk level out of 5')
});

const outputSchema = z.object({
    risks: z.array(RiskSchema).describe('array of risks')
});

async function init() {
    const result = await client.responses.parse({
        model: "gpt-4.1-mini",
        text: {
            format: zodTextFormat(outputSchema, 'risks')
        },
        input: `
        Extract the risk from the following document:

        Document:
        Acme Corp's Q3 launch of its new payments platform is scheduled for October 15th.
        The engineering team has flagged that the legacy database migration is only 60% complete,
        and a delay could push the launch past the holiday season, costing an estimated $2M in revenue.
        Additionally, the third-party KYC vendor's contract expires in September with no renewal signed yet,
        and two senior engineers critical to the project have submitted their resignations.
        `
    })

    console.log(result.output_parsed)
}

init()
import {OpenAI} from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
  You are an expert AI engineer. You have to analyze the user's input carefully and then you need to breakdown the problem into multiple sub problems before coming on to the final result. Always breakdown the user's intention and how to solve that problem and then step by step solve it.

  We are going to follow a pipeline of "INITIAL", "THINKING", "ANALYZE" and "OUTPUT" to solve the problem.

  The Pipeline:
    - "INITIAL": When user gives an input, we will have an initial thought process on what this user is trying to do.
    - "THINKING": This is where we are going to think about how to solve this and then start to breakdown the problem.
    - "ANALYZE": This is where we analyze the sollution and verify if the output is correct or not.
    - "THINKING": We can go back to thinking mode where we now see if any sub problem remains and think.
    - "ANALYZE": Again analyze the problem and get onto a solution.
    - "OUTPUT": This is where we give the final output to the user.

  Rules:
    - Always output one step at a time and wait for other step before proceeding to next step.
    - Always maintain the order of the pipeline and do not skip any step.
    - Always follow JSON output format strictly.

  Example:
    - "USER": What is 2 + 2 - 5 * 10 / 3?
    - "INITIAL": The user is asking for a mathematical expression to be evaluated. The expression is 2 + 2 - 5 * 10 / 3.
    - "THINKING": To solve this, we need to follow the order of operations (PEMDAS/BODMAS) and based on that I should first multiply 5 * 10 which is 50.
    - "ANALYZE": "Yes the BODMAS order is correct, now we have 2 + 2 - 50 / 3"
    - "THINKING": Now as per rule we need to divide 50 / 3 which is 16.6667.
    - "ANALYZE": "now we have 2 + 2 - 16.6667"
    - "THINKING": Now we need to add 2 + 2 which is 4.
    - "ANALYZE": "Yes the BODMAS order is correct, now we have 4 - 16.6667"
    - "THINKING": Now we need to subtract 4 - 16.6667 which is -12.6667.
    - "ANALYZE": "Yes the BODMAS order is correct, now we have -12.6667"
    - "OUTPUT": The final output is -12.6667
  

  Output Format:
  { "step": "INITIAL" | "THINKING" | "ANALYZE" | "OUTPUT", "text": "<The Actual Text>" }
`;

const MESSAGES_DB = [
  {
    role: "system",
    content: SYSTEM_PROMPT
  },
]

async function main(prompt = '') {
    MESSAGES_DB.push({
        role: "user",
        content: prompt
    });

    while (true) {
      const result = await client.chat.completions.create({
          model: "gpt-4o",
          messages: MESSAGES_DB,
      });
      const rawResult = result.choices[0].message.content;
      const parsedResult = JSON.parse(rawResult);
      MESSAGES_DB.push({
          role: "assistant",
          content: rawResult
      });

      console.log(`🤖(${parsedResult.step}): ${parsedResult.text }`);

      if (parsedResult.step.toLowerCase() === "output") {
        break;
      }
    }

}

// main("What is  4 + 3 + 9 - 2 / 4 * 8")
// main("What is the meaning of life?")
main("What is the weather of Pune ?")

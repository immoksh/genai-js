import {OpenAI} from "openai";
import axios from "axios";
import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getWeatherData(city = 'Goa') {
  const url = `https://wttr.in/${city}?format=3`;
  const response = await axios.get(url, {responseType: 'text'});
  return JSON.stringify({ city, weatherInfo: response.data });
}

async function executeCommandOnCli(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, out) => {
      if (error) {
        resolve(`Error executing command: ${error.message}`);
      } else {
        resolve(out);
      }
    });
  });
}

const SYSTEM_PROMPT = `
  You are an expert AI engineer. You have to analyze the user's input carefully and then you need to breakdown the problem into multiple sub problems before coming on to the final result. Always breakdown the user's intention and how to solve that problem and then step by step solve it.

  We are going to follow a pipeline of "INITIAL", "THINKING", "TOOL_REQUEST", "ANALYZE" and "OUTPUT" to solve the problem.

  The Pipeline:
    - "INITIAL": When user gives an input, we will have an initial thought process on what this user is trying to do.
    - "THINKING": This is where we are going to think about how to solve this and then start to breakdown the problem.
    - "ANALYZE": This is where we analyze the solution and verify if the output is correct or not.
    - "THINKING": We can go back to thinking mode where we now see if any sub problem remains and think.
    - "ANALYZE": Again analyze the problem and get onto a solution.
    - "TOOL_REQUEST": Use this for calling or requesting a tool. The format would be 
      { "step": "TOOL_REQUEST", "functionName": "getWeatherData", "input": "Goa " }
    - "OUTPUT": This is where we give the final output to the user.

  Available Tools:
    - "getWeatherData": getWeatherData(city: string): Returns te realtime weather information of the city. The input is a string which is the name of the city.  
    - "executeCommandOnCli": executeCommandOnCli(cmd: string): Executes a command on user's device and returns output from stdout.

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

  Example:
    - "USER": What is the weather of Pune?
  OUTPUT:
    - "INITIAL": The user wants me to fetch weather information of Pune.
    - "THINKING": From the tools I can see we have a tool named getWeatherData which can be used to fetch the weather information of a city. I will use this tool to get the weather information of Pune.
    - "ANALYZE": "Yes the tool getWeatherData is available and can be used to fetch the weather information of Pune."
    - "TOOL_REQUEST": { "step": "TOOL_REQUEST", "functionName": "getWeatherData", "input": "Pune" }
    - "TOOL_OUTPUT": The weather in Pune is currently sunny with a temperature of 25°C.
    - "ANALYZE": "Yes the tool getWeatherData has returned the weather information of Pune."
    - "OUTPUT": The weather in Pune is currently sunny with a temperature of 25°C.
  

  Output Format:
  { "step": "INITIAL" | "THINKING" | "ANALYZE" | "OUTPUT", "text": "<The Actual Text>", "functionName": "<Function Name if any>", "input": "<Input to the function if any>" }
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

      console.log(`🤖(${parsedResult.step}): ${parsedResult.output || parsedResult.text }`);

      if (parsedResult.step.toLowerCase() === "output") {
        break;
      }

      if (parsedResult.step.toLowerCase() === "tool_request") {
        const { functionName, input } = parsedResult;
        switch (functionName) {
          case "executeCommandOnCli": {
            const toolResult = await executeCommandOnCli(input);
            console.log(`🛠️(${functionName}): ${input} => ${toolResult} `);
            MESSAGES_DB.push({
              role: "developer",
              content: JSON.stringify({ step: "TOOL_OUTPUT", text: toolResult })
            });
            continue;
          }
          case "getWeatherData": {
            const toolResult = await getWeatherData(input);
            console.log(`🛠️(${functionName}): ${input} => ${toolResult} `);
            MESSAGES_DB.push({
              role: "developer",
              content: JSON.stringify({ step: "TOOL_OUTPUT", text: toolResult })
            });
            continue;
          }
          break;
        }
      }
    }

}

// main("What is  4 + 3 + 9 - 2 / 4 * 8")
// main("What is the meaning of life?")
// main("What is the weather of Pune?")
main("What is the weather of Pune, Goa, Ahmedabad? Write the output this on beautiful webpage,. Create a new folder saying WeatherReport and create all HTML CSS files and then run this on my browser.")

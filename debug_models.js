import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("Available Models:");
    for await (const m of models) {
        console.log(`- ${m.name}`);
    }
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

listModels();

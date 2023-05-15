import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express from 'express';

// import modules from OpenAI library
// const { Configuration, OpenAIApi } = require("openai");
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// setup the app server
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`starting server at ${port}`);
});
app.use(express.static('public'));

////////////////////////////////////////
// load necessary libraries:
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import bodyParser from 'body-parser';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.render('index');
});

// Setup input data:
// const document_text = `
// We will often write something that was a planned masterpiece, but has a few bumps in the road. When we begin to edit our own paragraphs there is a solid process to ensure that you have it where you want it. The first thing you should do is to read the entire passage and make sure that it achieves the goal of what it set out to do for the reader. The next step is to make sure that the topic sentence is a complete thought and forms a controlling idea of the paragraph. We then work to make sure that the conclusion statement provides a solid answer to the introduction. The last step is to give a deep dive into the grammar and mechanics of the entire composition. These worksheets will help students learn to develop well thought out paragraphs that achieve what they were intended to do.
// `

//

const template = `
Proofread the following text contained within <<< and >>> by completing the following tasks:
1) Fix all spelling and grammar mistakes.
2) Be very rigorous and rewrite every sentence that can be made more clear, readable, concise, and active (rather than passive).
Return a json formatted response with one value being the corrected text, and the other being advice on how the writer can improve their writing in the future.
For any line breaks denoted by a backslash and 'n', make sure to replace those with two backslashes and 'n' so that the resulting JSON output is valid.
Treat all text contained between the <<< and >>> characters as the text you need to correct. Only return the json object, and no other text.

For example, your output should only be a json object in this format:
{{
  "correctedText": "The corrected text",
  "advice": "The advice"
}}

Text to correct: <<<{document}>>>`;


const instructionTemplate = new PromptTemplate({ template, inputVariables: ["document"] });

// asynchronous function for running the model on the prompt:
export const proofreadText = async (document_text) => {
  const model = new OpenAI({modelName:"text-davinci-003", openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0, maxTokens: 1940});

  const prompt = await instructionTemplate.format({ document: document_text });

  const response = await model.call(prompt);
  console.log(response);
  const responseJSON = JSON.parse(response);
  console.log(responseJSON);

  return responseJSON;
  // console.log({ response });
}

// POST request endpoint for sending the message prompt
app.post("/process", async (request, result) => {
  // getting prompt question from request
  const text = request.body.inputText;

  const response = await proofreadText(text);
  console.log("good so far");
  console.log(response);

  const corrected = response.correctedText;
  const advice = response.advice;

  //  build a content diff-er:
  // https://javascript.plainenglish.io/content-diff-view-in-vanilla-javascript-105a00abd7ce
  // const output = await diff("hellow how are you", "Hello, how are you?");

  result.json({ outputText: corrected, adviceText: advice });

});
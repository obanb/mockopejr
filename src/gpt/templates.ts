import { Configuration, OpenAIApi, CreateCompletionRequest } from 'openai';
import { commonUtils } from '../utils/commonUtils.js';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || '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',
  organization: "org-31X1Fn2v6CdUdFKfvenAtK1a"
});

const openai = new OpenAIApi(configuration);


const templateSettings: Record<string, CreateCompletionRequest> = {
  determenisticCompletion: {
    model: "text-davinci-003",
    temperature: 1,
    max_tokens: 1000,
    top_p: 0.3,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
  }
}


const generateJSON = async(jsonPattern: unknown, additionalPrompt: string | null = null, cfg: Omit<CreateCompletionRequest, 'prompt'> | null = null) => {
  const defaultCfg = templateSettings.determenisticCompletion;

  const mergedCfg =  commonUtils.mergeObjects(defaultCfg, cfg || {});

  let prompt =  `
    1. JSON structure pattern: ${JSON.stringify(jsonPattern)}
    2. generate JSON with same structure, randomize content of each field
    3. make generated data similar  to the original data
    4. keep same natural language and datatype for each field as original field content (e.g. "Letadlo > Auto", "Car" > "Plane")
    5. return only JSON object, without any other text
  `
  if(additionalPrompt) {
    prompt += `6. apply additional prompt: ${additionalPrompt}`
  }

  mergedCfg.prompt = prompt

  const {data} = await openai.createCompletion(mergedCfg);

  return JSON.parse(data.choices[0].text);
}

export const templates = {
  generateJSON
}



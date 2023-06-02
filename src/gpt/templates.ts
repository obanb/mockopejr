import { Configuration, OpenAIApi, CreateCompletionRequest } from 'openai';
import { commonUtils } from '../utils/commonUtils.js';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: "org-31X1Fn2v6CdUdFKfvenAtK1a"
});

const openai = new OpenAIApi(configuration);


const templateSettings: Record<string, CreateCompletionRequest> = {
  determenisticCompletion: {
    model: "text-davinci-003",
    temperature: 1,
    max_tokens: 1000,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
  }
}


const generateJSON = async(jsonPattern: unknown, additionalPrompt: string | null = null, cfg: Omit<CreateCompletionRequest, 'prompt'> | null = null) => {
  const defaultCfg = templateSettings.determenisticCompletion;

  const mergedCfg =  commonUtils.mergeObjects(defaultCfg, cfg || {});

  let prompt =  `
    1. read this JSON structure pattern: ${JSON.stringify(jsonPattern)}
    2. generate JSON with same structure, but randomize content of each field
    3. make each generated data similar to the original data, but not the same
    4. keep same language of each field content
    5. use same data types as the original data
    7. return only JSON object, without any other text
  `
  if(additionalPrompt) {
    prompt += `8. apply this prompt to data: ${additionalPrompt}`
  }

  mergedCfg.prompt = prompt

  const {data} = await openai.createCompletion(mergedCfg);

  return JSON.parse(data.choices[0].text);
}

export const templates = {
  generateJSON
}



import {OpenAI} from 'openai';

import { commonUtils } from '../utils/commonUtils.js';

const configuration = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY || ""
});


const templateSettings: Record<string, Omit<OpenAI.Chat.ChatCompletionCreateParams, 'messages'>> = {
  jsonCompletion: {
    stream: false,
    model:"gpt-3.5-turbo",
    // lower temperature means greater determinism
    temperature: 0,
    max_tokens: 1000,
    // lower top_p means greater determinism, also lower determinism may lead to more time to generate response
    top_p: 0,
    // increasing frequency penalty will make the model less likely to repeat itself
    frequency_penalty: 0,
    // increasing presence penalty will make the model less likely to generate new topic branches
    presence_penalty: 0,
    response_format: { type: "json_object" },
  },
  valueCompletion: {
    stream: false,
    model:"gpt-3.5-turbo",
    temperature: 1,
    max_tokens: 1000,
    top_p: 0.3,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
    response_format: { type: "json_object" },
    seed: 0,
  }
}

const useGPT = async(prompt: string, exampleFormat: string | null = null, cfg: Omit<OpenAI.Chat.ChatCompletionCreateParams, 'messages'> | null = null): Promise<{value: unknown}> => {
  const defaultCfg = templateSettings.valueCompletion;

  const mergedCfg =  commonUtils.mergeObjects(defaultCfg, cfg || {});

  const prompts: OpenAI.Chat.ChatCompletionCreateParams["messages"] = [
    {"role": "user", "content": prompt},
    {"role": "system", "content": "return only single value suitable for JSON primitive types based on the prompt"},
    {"role": "system", "content": "JSON result will be always at property: 'value'"},
  ]


  if(exampleFormat) {
    prompts.push({"role": "system", "content": `apply example format for result: ${exampleFormat}`})
  }

  mergedCfg.messages = prompts;

  // simple completion is legacy at OpenAI now, using chat completions
  const completion = await configuration.chat.completions.create(<OpenAI.Chat.ChatCompletionCreateParams>mergedCfg);

  return JSON.parse(completion["choices"][0]?.message?.content)["value"]
}

export const templates = {
  useGPT,
}



import { Configuration, OpenAIApi } from 'openai';
import { CreateCompletionRequest } from 'openai/api';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const templateSettings: Record<string, CreateCompletionRequest> = {
  determenisticCompletion: {
    model: "text-davinci-003",
    temperature: 0,
    max_tokens: 150,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
    stop: ["You:"],
    prompt: ""
  }
}



const generateJSON = async(jsonPattern: unknown, cfg: Omit<CreateCompletionRequest, 'prompt'> | null = null) => {
  const defaultCfg = templateSettings.determenisticCompletion;

  const mergedCfg =  mergeObj(defaultCfg, cfg);

  const prompt =

  const completion = await openai.createCompletion(mergedCfg);

  return completion.data

}


const mergeObj = <A,B>(a: A, b: B) => {
  const cleaned = Object.fromEntries(Object.entries(b).filter(([_, v]) => v !== null))
  return {...a, ...cleaned}
};


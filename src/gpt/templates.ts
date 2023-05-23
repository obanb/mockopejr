import { Configuration, OpenAIApi, CreateCompletionRequest } from 'openai';

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
  }
}



const generateJSON = async(jsonPattern: unknown,  cfg: Omit<CreateCompletionRequest, 'prompt'> | null = null) => {
  const defaultCfg = templateSettings.determenisticCompletion;

  const mergedCfg =  mergeObj(defaultCfg, cfg);

  const prompt =  `
    1. read this JSON structure pattern: ${JSON.stringify(jsonPattern)}
    2. generate JSON with same structure, but randomize content of each field (except for the field names)
    3. make each generated data similar to the original data, but not the same (e.g. {postalCode: 12345} -> {postalCode: 12255}, {street: Pražská} -> {street: Jateční})
    4. try to keep same language of each field (e.g. {street: Pražská} -> {street: Pražská}, {street: 5th Avenue} -> {street: 7th Avenue})
    5. use same data types (e.g. {postalCode: 12345} -> {postalCode: 12345}, {postalCode: "12345"} -> {postalCode: "12345"})
    6 apply additional prompt: ${mergedCfg.prompt}
    7. return only JSON object
  `
  mergedCfg.prompt = prompt;

  const completion = await openai.createCompletion(mergedCfg);

  return completion.data

}


const mergeObj = <A,B>(a: A, b: B) => {
  const cleaned = Object.fromEntries(Object.entries(b).filter(([_, v]) => v !== null))
  return {...a, ...cleaned}
};


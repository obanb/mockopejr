import { templates } from '../gpt/templates.js';

const defaultValues = {
  sequence: {
    type: 'VALUE',
    subtype: 'SEQUENCE',
    match: /\w+/,
    value: 'SEQUENCE',
  },
}

const defaultSymbols = {
  leftParen: {
    type: 'SYMBOL',
    subtype: 'LEFT_PAREN',
    match: /\(/,
    value: '(',
  },
  rightParen: {
    type: 'SYMBOL',
    subtype: 'RIGHT_PAREN',
    match: /\)/,
    value: ')',
  },
  comma: {
    type: 'SYMBOL',
    subtype: 'COMMA',
    match: /\,/,
    value: ',',
  },
}

const defaultDictionary = {
  '#EXACT': {
    type: 'EXPRESSION',
    subtype: '#EXACT',
    match: /\#EXACT/,
    value: '#EXACT',
  },
  '#STRINGIFY': {
    type: 'EXPRESSION',
    subtype: '#STRINGIFY',
    match: /\#STRINGIFY/,
    value: '#STRINGIFY',
  },
  '#RANGE': {
    type: 'EXPRESSION',
    subtype: '#RANGE',
    match: /\#RANGE/,
    value: '#RANGE',
  },
  '#RANGE_FLOAT': {
    type: 'EXPRESSION',
    subtype: '#RANGE',
    match: /\#RANGE/,
    value: '#RANGE',
  },
  '#INSERT': {
    type: 'EXPRESSION',
    subtype: '#INSERT',
    match: /\#INSERT/,
    value: '#INSERT',
  },
  '#ENUM': {
    type: 'EXPRESSION',
    subtype: '#ENUM',
    match: /\#ENUM/,
    value: '#ENUM',
  },
  '#DATETIME_RANGE_ISO': {
    type: 'EXPRESSION',
    subtype: '#DATETIME_RANGE_ISO',
    match: /\#DATETIME_RANGE_ISO/,
    value: '#DATETIME_RANGE_ISO',
  },
  '#DATE_RANGE': {
    type: 'EXPRESSION',
    subtype: '#DATE_RANGE',
    match: /\#DATE_RANGE/,
    value: '#DATE_RANGE',
  },
  '#USE_GPT_VALUE': {
    type: 'EXPRESSION',
    subtype: '#USE_GPT_VALUE',
    match: /\#USE_GPT_VALUE/,
    value: '#USE_GPT_VALUE',
  },
  '#USE_GPT_JSON': {
    type: 'EXPRESSION',
    subtype: '#USE_GPT_JSON',
    match: /\#USE_GPT_JSON/,
    value: '#USE_GPT_JSON',
  },
  // add your custom expressions here
  '#EXAMPLE_CUSTOM_EXPRESSION': {
    type: 'EXPRESSION',
    subtype: '#EXAMPLE_CUSTOM_EXPRESSION',
    match: /\#EXAMPLE_CUSTOM_EXPRESSION/,
    value: '#EXAMPLE_CUSTOM_EXPRESSION',
  }
}

const defaultBindings = (expression: keyof typeof defaultDictionary) => {
  switch (expression) {
    case '#RANGE':
      return (x: string, y: string) => {
          // place for your custom logic or validation fn
          const n1 = parseInt(x);
          const n2 = parseInt(y);
          return Math.floor(Math.random() * (n2 - n1) + n1);
        }
    case '#RANGE_FLOAT':
      return (x: string, y: string, decimalPlaces: string) => {
        // place for your custom logic or validation fn
        const decimals = parseInt(decimalPlaces);
        const n1 = parseInt(x);
        const n2 = parseInt(y);
        const r = Math.random() * (n2 - n1) + n1;
        return parseFloat(r.toFixed(decimals));
      }
    case '#STRINGIFY':
      // place for your custom logic or validation fn
      return JSON.stringify;
    case '#EXACT':
      return (value: unknown) => value
    case '#INSERT':
      return (args: [unknown, unknown, unknown]) => {
        // place for your custom logic or validation fn
        return `${args[0] || ''}${args[2] || ''}${args[1] || ''}`;
      };
    case '#ENUM':
      return (en: string[]) => {
        // place for your custom logic or validation fn
        return en[Math.floor(Math.random() * en.length)]
      }
    case '#DATETIME_RANGE_ISO':
      // start/end YYYY-MM-DDTHH:MM:SS
      // return YYYY-MM-DDTHH:MM:SS
      return (start: string, end: string) => {
        // place for your custom logic or validation fn
        const startDate = new Date(start);
        const endDate = new Date(end);
        return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())).toISOString();
      }
    case '#DATE_RANGE':
      // start/end YYYY-MM-DDTHH:MM:SS
      // return YYYY-MM-DD
      return (start: string, end: string) => {
        // place for your custom logic or validation fn
        const startDate = new Date(start);
        const endDate = new Date(end);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        return randomDate.toISOString().split('T')[0];
      }
    case '#USE_GPT_VALUE':
      return async(prompt: string, formatSpecs: string) => {
        const val = await templates.createValue(prompt, formatSpecs)
        return val
      }
    case '#USE_GPT_JSON':
      return async(jsonPattern: unknown, additionalPrompt: string) => {
        const val = await templates.similirizeJson(jsonPattern, additionalPrompt)
        return val
      }
      // PLACE FOR YOUR CUSTOM BINDINGS
      case '#EXAMPLE_CUSTOM_EXPRESSION':
        return (value: unknown) => {
          // place for your custom logic or validation fn
          // your whatever logic here
          return 'example custom binding'
        }
    default: {
      const exhaustive: never = expression
      throw new Error(exhaustive);
    }
  }
}


export const dictionary = {
  defaultValues,
  defaultDictionary,
  defaultSymbols,
  defaultBindings
}

import { templates } from '../gpt/templates.js';
import { Counter } from './counter.js';
import { v4 as uuidv4 } from 'uuid';

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
    subtype: '#RANGE_FLOAT',
    match: /\#RANGE_FLOAT/,
    value: '#RANGE_FLOAT',
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
  '#BOOLEAN': {
    type: 'EXPRESSION',
    subtype: '#BOOLEAN',
    match: /\#BOOLEAN/,
    value: '#BOOLEAN',
  },
  '#UUID': {
    type: 'EXPRESSION',
    subtype: '#UUID',
    match: /\#UUID/,
    value: '#UUID',
  },
  '#COUNTER': {
    type: 'EXPRESSION',
    subtype: '#COUNTER',
    match: /\#COUNTER/,
    value: '#COUNTER',
  },
  '#USE_GPT': {
    type: 'EXPRESSION',
    subtype: '#USE_GPT',
    match: /\#USE_GPT/,
    value: '#USE_GPT',
  },
  // add your custom expressions here
  '#EXAMPLE_CUSTOM_EXPRESSION': {
    type: 'EXPRESSION',
    subtype: '#EXAMPLE_CUSTOM_EXPRESSION',
    match: /\#EXAMPLE_CUSTOM_EXPRESSION/,
    value: '#EXAMPLE_CUSTOM_EXPRESSION',
  }
}

const defaultBindings = (expression: keyof typeof defaultDictionary, counters: ReturnType<Counter["counters"]>) => {
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
        const n1 = parseFloat(x);
        const n2 = parseFloat(y);
        const r = Math.random() * (n2 - n1) + n1;
        return parseFloat(r.toFixed(decimals));
      }
    case '#STRINGIFY':
      // place for your custom logic or validation fn
      return JSON.stringify;
    case '#EXACT':
      return (value: unknown) => value
    case '#INSERT':
      return (...args: [unknown, unknown, unknown]) => {
        // place for your custom logic or validation fn
        return `${args[0] || ''}${args[2] || ''}${args[1] || ''}`;
      };
    case '#ENUM':
      return (...en: string[]) => {
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
    case '#BOOLEAN':
      return async() => {
        return Math.random() >= 0.5;
      }
    case '#UUID':
      return () => {
        return uuidv4();
      }
    case '#COUNTER':
      return (id: string, start: string) => {
          if(counters.get(id)) {
            return counters.get(id).inc()
          }else{
            counters.add(id, parseInt(start))
            return counters.get(id).get()
          }
      }
    case '#USE_GPT':
      return async(prompt: string, formatSpecs: string) => {
        const val = await templates.useGPT(prompt, formatSpecs)
        console.log(val)
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

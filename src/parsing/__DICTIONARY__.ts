
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
    subtype: '#DATE_RANGE_ISO',
    match: /\#DATE_RANGE_ISO/,
    value: '#DATE_RANGE_ISO',
  },
  '#DATE_RANGE': {
    type: 'EXPRESSION',
    subtype: '#DATE_RANGE_ISO',
    match: /\#DATE_RANGE_ISO/,
    value: '#DATE_RANGE_ISO',
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
    case '#USE_GPT':
      return (prompt: string, formatSpecs: string) => {
        return prompt
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
  defaultDictionary,
  defaultBindings
}

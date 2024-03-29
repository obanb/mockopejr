
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

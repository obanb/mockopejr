import { Expression } from './types.js';

const bind = (exp: Expression) => {
  switch (exp) {
    case '#RANGE':
      return (x: string, y: string) => {
        if (isWholeNumber(x) && isWholeNumber(y)) {
          const n1 = parseInt(x);
          const n2 = parseInt(y);
          return Math.random() * (n2 - n1) + n1;
        }
        throw new Error('shit');
      };
    case '#STRINGIFY':
      return JSON.stringify;
    case '#INSERT':
      return (...args: any[]) => {
        if (args && args.length > 3) {
          throw new Error('shit');
        }
        return `${args[0] || ''}${args[2] || ''}${args[1] || ''}`;
      };
    default: {
      const exhaustive: never = exp as never;
      throw new Error(exhaustive);
    }
  }
};


const isWholeNumber = (str: string) => {
  // check if the string only contains digits
  if (/^\d+$/.test(str)) {
    // use parseInt to parse the string into an integer
    const num = parseInt(str);
    // check if the parsed number is not NaN and is finite
    return !isNaN(num) && isFinite(num);
  }
  return false;
}

export const bindings = {
  bind
}

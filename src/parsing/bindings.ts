import { Expression } from './types.js';

const bind = (exp: Expression) => {
  switch (exp) {
    case '#RANGE':
      return (x: string, y: string) => {
        if (isWholeNumber(x) && isWholeNumber(y)) {
          const n1 = parseInt(x);
          const n2 = parseInt(y);
          console.log('b')
          return Math.floor(Math.random() * (n2 - n1) + n1);

        }
        throw new Error('shit');
      };
    case '#STRINGIFY':
      return JSON.stringify;
    case '#EXACT':
      return (value: unknown) => value
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


const validate = (exp: Expression): (...args: string[]) => Expression => {
  switch (exp) {
    case '#RANGE':
      return (...args: string[]) => {
        checkArgsCount(exp, args, 2,2, '#RANGE(1,10)')

        if (!isWholeNumber(args[0]) || !isWholeNumber(args[1])) {
          throw new Error(`${exp} - wrong argument format, somewhere near ${exp}(${args}). Expected format: #RANGE(1,10)`)
        }

        return exp
      }
    case '#STRINGIFY':
      return (...args: []) => {
        checkArgsCount(exp, args, 1,1, "#STRINGIFY(1)")
        return exp
      };
    case '#INSERT':
      return (...args: []) => {
        checkArgsCount(exp, args, 3,3, "#INSERT(SOME_PREFIX-,-SOME_SUFFIX,#STRINGIFY(#RANGE(1,3)))")
        return exp
      };
    default: {
      const exhaustive: never = exp as never;
      throw new Error(exhaustive);
    }
  }
};

const checkArgsCount = (exp: Expression, args: string[], min: number, max: number, example: string) => {
    const len = args.length;

    if(len < min || len > max){
      throw new Error(`${exp} - wrong number of arguments, somewhere near ${exp}(${args}). Expected format: ${example}`)
    }
}

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
  bind,
  validate
}









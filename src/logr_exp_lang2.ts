// NLOGR expression parser
// minimalistic expression parser based on expression composition
// input > tokenizer > tokens >  parser > AST > traverser > output


// TOKENIZER
// splits input string into arrays of individual tokens

// input = "#INSERT(SOME_PREFIX-,-SOME_SUFFIX,#STRINGIFY(#RANGE(1,3)))"

// const tokens = [
//   {
//     type: 'EXPRESSION',
//     subtype: '#INSERT',
//     value: '#INSERT',
//   },
//   {
//     type: 'SYMBOL',
//     subtype: 'LEFT_PAREN',
//     value: '(',
//   },
//   {
//     type: 'VALUE',
//     subtype: 'SEQUENCE',
//     value: 'SOME_PREFIX-',
//   },
//   {
//     type: 'SYMBOL',
//     subtype: 'COMMA',
//     value: ',',
//   },
//   {
//     type: 'VALUE',
//     subtype: 'SEQUENCE',
//     value: '-SOME_SUFFIX',
//   },
//   {
//     type: 'SYMBOL',
//     subtype: 'COMMA',
//     value: ',',
//   },
//   {
//     type: 'EXPRESSION',
//     subtype: '#STRINGIFY',
//     value: '#STRINGIFY',
//   },
//   {
//     type: 'SYMBOL',
//     subtype: 'LEFT_PAREN',
//     value: '(',
//   },
//   {
//     type: 'EXPRESSION',
//     subtype: '#RANGE',
//     value: '#RANGE',
//   },
//   {
//     type: 'SYMBOL',
//     subtype: 'LEFT_PAREN',
//     value: '(',
//   },
//   {
//     type: 'VALUE',
//     subtype: 'SEQUENCE',
//     value: '1',
//   },
//   {
//     type: 'SYMBOL',
//     subtype: 'COMMA',
//     value: ',',
//   },
//   {
//     type: 'VALUE',
//     subtype: 'SEQUENCE',
//     value: '3',
//   },
//   {
//     type: 'SYMBOL',
//     subtype: 'RIGHT_PAREN',
//     value: ')',
//   },
//   {
//     type: 'SYMBOL',
//     subtype: 'RIGHT_PAREN',
//     value: ')',
//   },
//   {
//     type: 'SYMBOL',
//     subtype: 'RIGHT_PAREN',
//     value: ')',
//   },
// ];

// PARSER
// traverses the token array and serializes it into a hierarchy of parents, children and splits into types

// const AST = {
//   value: 'program',
//   children: [
//     {
//       value: '#INSERT',
//       children: [
//         {
//           value: 'SOME_PREFIX-',
//           type: 'ARGS',
//           children: [],
//         },
//         {
//           value: '-SOME_SUFFIX',
//           type: 'ARGS',
//           children: [],
//         },
//         {
//           value: '#STRINGIFY',
//           children: [
//             {
//               value: '#RANGE',
//               children: [
//                 {
//                   value: '1',
//                   type: 'ARGS',
//                   children: [],
//                 },
//                 {
//                   value: '3',
//                   type: 'ARGS',
//                   children: [],
//                 },
//               ],
//               type: 'EXPRESSION',
//             },
//           ],
//           type: 'EXPRESSION',
//         },
//       ],
//       type: 'EXPRESSION',
//     },
//   ],
//   type: 'PROGRAM',
// };

// TRAVERSER
// recursively traverses the parents and their children and evaluates the result in the composition style (a(b(c(value))) according to the assigned function

// input =  "#INSERT(SOME_PREFIX-,-SOME_SUFFIX,#STRINGIFY(#RANGE(1,3)))"
// const result = SOME_PREFIX-2.2161299227719167-SOME_SUFFIX


type Expression = '#EXACT' | '#STRINGIFY' | '#RANGE' | '#INSERT';

type GrammerSubtype =
  | Expression
  | 'LEFT_PAREN'
  | 'RIGHT_PAREN'
  | 'COMMA'
  | 'UNKNOWN'
  | 'SEQUENCE'
  | Expression;

type GrammerType = 'SYMBOL' | 'VALUE' | 'IGNORE' | 'EXPRESSION' | 'UNKNOWN';

type Grammer = {
  type: GrammerType;
  subtype: GrammerSubtype;
  match: RegExp;
  value: string;
};

type Dictionary = Record<string, Grammer>;

const grammar: Dictionary = {
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
  '#INSERT': {
    type: 'EXPRESSION',
    subtype: '#INSERT',
    match: /\#INSERT/,
    value: '#INSERT',
  },
  word: {
    type: 'VALUE',
    subtype: 'SEQUENCE',
    match: /\w+/,
    value: 'SEQUENCE',
  },
};

type Token = Omit<Grammer, 'value' | 'match'> & { value: unknown };

type AST = {
  value: null | unknown;
  children: AST[];
  type: 'EXPRESSION' | 'ARGS' | 'PROGRAM';
};

// TOKENIZER
// splitsthe input string into arrays of individual tokens

function tokenizer(input: string): Token[] {
  const dictionary: Grammer[] = Object.values(grammar);

  const grammarRegex = /(#\w+|\(|,|\))/;

  // define a regular expression to split input string into array of matches
  const tokens = input
    .split(grammarRegex)
    .filter((token) => token.trim() !== '');

  // map each token to an dictionary regulars and recognize it
  return tokens.map((token) => {
    const match = dictionary.find((d) => token.match(d.match));
    if (match) {
      return {
        type: match.type,
        subtype: match.subtype,
        value: token,
      };
    }
    return {
      type: 'UNKNOWN',
      subtype: 'UNKNOWN',
      value: token,
    };
  });
}

// PARSER
// traverses the token array and serializes it into a hierarchy of parents, children and splits into types

const parser = (tokens: Token[]): AST => {
  const relevantTokens = tokens.filter(
    (t) => t.type === 'EXPRESSION' || t.type === 'VALUE',
  );
  const ast: AST = { value: 'program', children: [], type: 'PROGRAM' };
  let currentParent = ast;
  for (const token of relevantTokens) {
    // if the token is an expression, then push it as a new node to the current parent as a child
    // then swap the current parent for the new node
    // else just push args to current parrent
    if (token.type === 'EXPRESSION') {
      const node: AST = {
        value: token.value,
        children: [],
        type: 'EXPRESSION',
      };
      currentParent.children.push(node);
      currentParent = node;
    } else {
      currentParent.children.push({
        value: token.value,
        type: 'ARGS',
        children: [],
      });
    }
  }

  return ast;
};

function isWholeNumber(str: string) {
  // check if the string only contains digits
  if (/^\d+$/.test(str)) {
    // use parseInt to parse the string into an integer
    const num = parseInt(str);
    // check if the parsed number is not NaN and is finite
    return !isNaN(num) && isFinite(num);
  }
  return false;
}

const expressionHooks = (exp: Expression) => {
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

// TRAVERSER
// recursively traverses the parents and their children and evaluates the result in the composition style (a(b(c(value))) according to the assigned function

const traverser = (ast: AST): unknown => {
  if (ast.type === 'PROGRAM') {
    return traverser(ast.children[0]);
  }
  if (ast.type === 'EXPRESSION') {
    // find a match between the expression and the implementation of the assigned function
    const expHook = expressionHooks(ast.value as Expression);
    // recursively traverses the descendants of each parent (nodes) for each descendant (node) of the expression type
    // if the args type is found, the recursion terminates and proceeds to the next descendant
    const expArgs = ast.children.map((child) => traverser(child));
    console.log(expArgs);
    // @ts-ignore
    return expHook(...expArgs);
  }
  if (ast.type === 'ARGS') {
    return ast.value;
  }
  throw new Error(`Unknown AST node type: ${ast.type}`);
};

const t = tokenizer('#INSERT(EGDPORTAL-,-LPZ,#STRINGIFY(#RANGE(1,3)))');
// const t = tokenizer("#STRINGIFY({a:1,b:2})")
const p = parser(t);

const f = traverser(p);

console.log(f);

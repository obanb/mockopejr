import { AST, Dictionary, Expression, Grammer, Token } from './types.js';
import { bindings } from './bindings.js';
import { dictionary } from './__DICTIONARY__.js';


/**
-----------------
EXPRESSION PARSER
-----------------

minimalistic expression parser based on expression composition

input > tokenizer > tokens >  parser > AST > traverser > output

*/



/**
---------
TOKENIZER
---------

splits input string into arrays of individual tokens

input = "#INSERT(SOME_PREFIX-,-SOME_SUFFIX,#STRINGIFY(#RANGE(1,3)))"


const tokens = [
  {
    type: 'EXPRESSION',
    subtype: '#INSERT',
    value: '#INSERT',
  },
  {
    type: 'SYMBOL',
    subtype: 'LEFT_PAREN',
    value: '(',
  },
  {
    type: 'VALUE',
    subtype: 'SEQUENCE',
    value: 'SOME_PREFIX-',
  },
  {
    type: 'SYMBOL',
    subtype: 'COMMA',
    value: ',',
  },
  {
    type: 'VALUE',
    subtype: 'SEQUENCE',
    value: '-SOME_SUFFIX',
  },
  {
    type: 'SYMBOL',
    subtype: 'COMMA',
    value: ',',
  },
  {
    type: 'EXPRESSION',
    subtype: '#STRINGIFY',
    value: '#STRINGIFY',
  },
  {
    type: 'SYMBOL',
    subtype: 'LEFT_PAREN',
    value: '(',
  },
  {
    type: 'EXPRESSION',
    subtype: '#RANGE',
    value: '#RANGE',
  },
  {
    type: 'SYMBOL',
    subtype: 'LEFT_PAREN',
    value: '(',
  },
  {
    type: 'VALUE',
    subtype: 'SEQUENCE',
    value: '1',
  },
  {
    type: 'SYMBOL',
    subtype: 'COMMA',
    value: ',',
  },
  {
    type: 'VALUE',
    subtype: 'SEQUENCE',
    value: '3',
  },
  {
    type: 'SYMBOL',
    subtype: 'RIGHT_PAREN',
    value: ')',
  },
  {
    type: 'SYMBOL',
    subtype: 'RIGHT_PAREN',
    value: ')',
  },
  {
    type: 'SYMBOL',
    subtype: 'RIGHT_PAREN',
    value: ')',
  },
];

 */


/**
 ---------
 PARSER
 ---------

traverses the token array and serializes it into a hierarchy of parents & children into simple AST

const AST = {
  value: 'program',
  children: [
    {
      value: '#INSERT',
      children: [
        {
          value: 'SOME_PREFIX-',
          type: 'ARGS',
          children: [],
        },
        {
          value: '-SOME_SUFFIX',
          type: 'ARGS',
          children: [],
        },
        {
          value: '#STRINGIFY',
          children: [
            {
              value: '#RANGE',
              children: [
                {
                  value: '1',
                  type: 'ARGS',
                  children: [],
                },
                {
                  value: '3',
                  type: 'ARGS',
                  children: [],
                },
              ],
              type: 'EXPRESSION',
            },
          ],
          type: 'EXPRESSION',
        },
      ],
      type: 'EXPRESSION',
    },
  ],
  type: 'PROGRAM',
};

*/

/**
---------
TRAVERSER
---------
recursively traverses the parents and their children and evaluates the result in the composition style (a(b(c(value))) according to the assigned function
final step - each node execution transformation

input =  "#INSERT(SOME_PREFIX-,-SOME_SUFFIX,#STRINGIFY(#RANGE(1,3)))"
const result = SOME_PREFIX-2.2161299227719167-SOME_SUFFIX

*/

const tokenizer = (dictionary: Dictionary) => (input: string): Token[] => {
  const grammer: Grammer[] = Object.values(dictionary);

  const grammarRegex = /(#\w+|\(|,|\))/;

  // define a regular expression to split input string into array of matches
  const tokens = input
    .split(grammarRegex)
    .filter((token) => token.trim() !== '');

  // map each token to an dictionary regulars and recognize it
  return tokens.map((token) => {
    const match = grammer.find((d) => token.match(d.match));
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


// TRAVERSER
// recursively traverses the parents and their children and evaluates the result in the composition style (a(b(c(value))) according to the assigned function

const traverser = (ast: AST): unknown => {
  if (ast.type === 'PROGRAM') {
    return traverser(ast.children[0]);
  }
  if (ast.type === 'EXPRESSION') {
    // find a match between the expression and the implementation of the assigned function
    const expHook = bindings.bind(ast.value as Expression);
    // recursively traverses the descendants of each parent (nodes) for each descendant (node) of the expression type
    // if the args type is found, the recursion terminates and proceeds to the next descendant
    const expArgs = ast.children.map((child) => traverser(child));
    console.log(expArgs);

    // @ts-ignore
    bindings.validate(ast.value as Expression)(...expArgs)

    // @ts-ignore
    return expHook(...expArgs);
  }
  if (ast.type === 'ARGS') {
    return ast.value;
  }
  throw new Error(`Unknown AST node type: ${ast.type}`);
};

const _new = () => {
  // probably must be asserted because of imported dictionary has dynamic type, because of inner dictionary typeguard
  // it's more comfortable to use at __DICTIONARY__.ts file
  const __dictionary: Dictionary = dictionary.defaultDictionary as Dictionary
  const __tokenizer = tokenizer(__dictionary);
  return {
    proceed: (input: string) => {
      const tokens = __tokenizer(input);
      const ast = parser(tokens);
      return traverser(ast);
    }
  }
}

export const expressionParser = {
  tokenizer,
  traverser,
  parser,
  _new
}

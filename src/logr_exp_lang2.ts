
const grammar = {
  leftParen : {
    type: 'symbol',
    subtype: 'paren',
    match: /\(/
    // type: CUMMULATIVE
  },
  rightParen : {
    type: 'symbol',
    subtype: 'paren',
    match: /\)/
  },
  squareBracketLeft : {
    type: 'symbol',
    subtype: 'paren',
      match: /\[/,
  },
  squareBracketRight : {
    type: 'symbol',
    subtype: 'paren',
    match: /\]/,
  },
  whitespace: {
    type: 'ignore',
    subtype: 'whitespace',
    match: /\s/
  }
}
const tokenizer = (input: string) => {
  const tokens: {grammar: {type: string, subtype: string}, value: unknown}[] = []

  let cursor = 0

  const moveNext = (amount: number = 1) => {
    cursor += amount
  }

  while(cursor < input.length){
    const char = input[cursor]
    if(char === '('){
      tokens.push({grammar: grammar.leftParen, value: char})
      moveNext()
      continue
    }

    if(char === ')'){
      tokens.push({grammar: grammar.rightParen, value: char})
      moveNext()
      continue
    }

    if(char === '['){
      tokens.push({grammar: grammar.squareBracketLeft, value: char})
      moveNext()
      continue
    }

    if(char === ']'){
      tokens.push({grammar: grammar.squareBracketRight, value: char})
      moveNext()
      continue
    }

    let WHITESPACE_REG = /\s/;
    if(WHITESPACE_REG.test(char)){
      // skip whitespaces, not adding them to the tokens
      moveNext()
      continue
    }
  }
}



export type Expression = '#EXACT' | '#STRINGIFY' | '#RANGE' | '#INSERT';

export type GrammerSubtype =
  | Expression
  | 'LEFT_PAREN'
  | 'RIGHT_PAREN'
  | 'COMMA'
  | 'UNKNOWN'
  | 'SEQUENCE'
  | Expression;

export type GrammerType = 'SYMBOL' | 'VALUE' | 'IGNORE' | 'EXPRESSION' | 'UNKNOWN';

export type Grammer = {
  type: GrammerType;
  subtype: GrammerSubtype;
  match: RegExp;
  value: string;
};

export type Dictionary = Record<string, Grammer>;

export type Token = Omit<Grammer, 'value' | 'match'> & { value: unknown };

export type AST = {
  value: null | unknown;
  children: AST[];
  type: 'EXPRESSION' | 'ARGS' | 'PROGRAM';
};

export type JsonPrimitive = string | number | boolean | null;


export type Expression =
  | '#EXACT'
  | '#STRINGIFY'
  | '#RANGE'
  | '#INSERT'
  | '#ENUM'
  | '#DATETIME_RANGE_ISO'
  | '#DATE_RANGE'
  | '#BOOLEAN'
  | '#UUID'
  | '#COUNTER'
  | '#USE_GPT'
  | '#EXAMPLE_CUSTOM_EXPRESSION'
  | '#RANGE_FLOAT';
export type GrammerType =
  | 'SYMBOL'
  | 'VALUE'
  | 'IGNORE'
  | 'EXPRESSION'
  | 'UNKNOWN';
export type GrammerSubtype =
  | Expression
  | 'LEFT_PAREN'
  | 'RIGHT_PAREN'
  | 'COMMA'
  | 'UNKNOWN'
  | 'SEQUENCE';
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

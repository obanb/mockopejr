import { reflection } from './reflection.js';

const _LOGR_PREFIX = '#';

enum LogrKeyword {
  Enum = 'ENUM',
  Exact = 'EXACT',
  NRange = 'NRANGE',
  SRange = 'SRANGE',
  DRange = 'DRANGE',
  Stringify = 'STR',
}

type ExpressionLiteral = `${KeywordLiteral}[${string}]`;
type KeywordLiteral = `#${LogrKeyword}`;

type ValueExpression = {
  keyword: LogrKeyword;
  value: string;
};

const isExpr = (elem: unknown): elem is ExpressionLiteral => {
  let keyword = false;
  if (reflection.isString(elem)) {
    Object.values(LogrKeyword).forEach((kw) => {
      const logrKw = `${_LOGR_PREFIX}${kw}`;

      if (elem.includes(logrKw)) {
        keyword = true;
      }
    });
  }
  return keyword;
};

const getExpr = (elem: ExpressionLiteral) => {
  let expr: ValueExpression | null;
  Object.values(LogrKeyword).forEach((kw) => {
    const logrKw = `${_LOGR_PREFIX}${kw}`;

    if (elem.includes(logrKw)) {
      expr = {
        value: elem.replace(logrKw, ''),
        keyword: kw,
      };
    }
  });

  if (!expr) {
    throw new Error('unknown Logr Keyword');
  }

  return expr;
};

const executeExpr = (expr: ValueExpression): unknown => {
  const json = JSON.parse(expr.value);

  switch (expr.keyword) {
    case LogrKeyword.Enum: {
      if (Array.isArray(json)) {
        return json[Math.floor(Math.random() * json.length)];
      } else {
        throw new Error(
          `Logr expression ${expr.keyword} must be a non-empty array. Example syntax: "#ENUM[\\"car\\", \\"bike\\"]"`,
        );
      }
    }
    case LogrKeyword.Exact: {
      if (Array.isArray(json) && json.length === 1) {
        return json[0];
      } else {
        throw new Error(
          `Logr expression ${expr.keyword} must be an array of one element. Example syntax: "#EXACT[\\"car\\"]"`,
        );
      }
    }
    case LogrKeyword.DRange: {
      return json;
    }
    case LogrKeyword.SRange: {
      return json;
    }
    case LogrKeyword.NRange: {
      return json;
    }
    case LogrKeyword.Stringify: {
      return json;
    }
    default: {
      const exhaustive: never = expr.keyword;
      throw new Error(exhaustive);
    }
  }
};

export const logr_expr_lang = {
  isExpr,
  getExpr,
  executeExpr,
};

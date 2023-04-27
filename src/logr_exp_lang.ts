// import { reflection } from './reflection.js';
//
// const _LOGR_PREFIX = '#';
//
// enum LogrKeyword {
//   Enum = 'ENUM',
//   Exact = 'EXACT',
//   NRange = 'NRANGE',
//   SRange = 'SRANGE',
//   DRange = 'DRANGE',
//   Stringify = 'STR',
// }
//
// type ExpressionLiteral = `${KeywordLiteral}[${string}]`;
// type KeywordLiteral = `#${LogrKeyword}`;
//
// type ValueExpression = {
//   keyword: LogrKeyword;
//   value: string;
// };
//
// const isExpr = (elem: unknown): elem is ExpressionLiteral => {
//   let keyword = false;
//   if (reflection.isString(elem)) {
//     Object.values(LogrKeyword).forEach((kw) => {
//       const logrKw = `${_LOGR_PREFIX}${kw}`;
//
//       if (elem.includes(logrKw)) {
//         keyword = true;
//       }
//     });
//   }
//   return keyword;
// };
//
// // const isExprFlow = () => {
// //   console.log('TODO')
// // }
//
// const getExpr = (elem: ExpressionLiteral) => {
//   let expr: ValueExpression | null;
//   Object.values(LogrKeyword).forEach((kw) => {
//     const logrKw = `${_LOGR_PREFIX}${kw}`;
//
//     if (elem.includes(logrKw)) {
//       expr = {
//         value: elem.replace(logrKw, ''),
//         keyword: kw,
//       };
//     }
//   });
//
//   if (!expr) {
//     throw new Error('unknown Logr Keyword');
//   }
//
//   return expr;
// };
//
// const executeExpr = (expr: ValueExpression): unknown => {
//   const json = JSON.parse(expr.value);
//
//   switch (expr.keyword) {
//     case LogrKeyword.Enum: {
//       if (Array.isArray(json)) {
//         return json[Math.floor(Math.random() * json.length)];
//       } else {
//         throw new Error(
//           `Logr expression ${expr.keyword} must be a non-empty array. Example syntax: "#ENUM[\\"car\\", \\"bike\\"]"`,
//         );
//       }
//     }
//     case LogrKeyword.Exact: {
//       if (Array.isArray(json) && json.length === 1) {
//         return json[0];
//       } else {
//         throw new Error(
//           `Logr expression ${expr.keyword} must be an array of one element. Example syntax: "#EXACT[\\"car\\"]"`,
//         );
//       }
//     }
//     case LogrKeyword.SRange: {
//       const errorMsg = `Logr expression ${expr.keyword} must be an array of one element. Example syntax: "#SRANGE[1,5]"`;
//       if (Array.isArray(json) && json.length === 2) {
//         const r1 = json[0];
//         const r2 = json[1];
//
//         if (!isNaN(r1) && r1 % 1 === 0 && !isNaN(r2) && r2 % 1 == 0) {
//           const n = Math.random() * (r2 - r1) + r1;
//           return n.toString();
//         } else {
//           throw new Error(errorMsg);
//         }
//       } else {
//         throw new Error(errorMsg);
//       }
//     }
//     case LogrKeyword.NRange: {
//       const errorMsg = `Logr expression ${expr.keyword} must be an array of one element. Example syntax: "#DRANGE[1,5]"`;
//       if (Array.isArray(json) && json.length === 2) {
//         const r1 = json[0];
//         const r2 = json[1];
//
//         if (!isNaN(r1) && r1 % 1 === 0 && !isNaN(r2) && r2 % 1 == 0) {
//           return Math.random() * (r2 - r1) + r1;
//         } else {
//           throw new Error(errorMsg);
//         }
//       } else {
//         throw new Error(errorMsg);
//       }
//     }
//     case LogrKeyword.DRange: {
//       return json;
//     }
//     case LogrKeyword.Stringify: {
//       return JSON.stringify(json);
//     }
//     default: {
//       const exhaustive: never = expr.keyword;
//       throw new Error(exhaustive);
//     }
//   }
// };
//
// export const logr_expr_lang = {
//   isExpr,
//   getExpr,
//   executeExpr,
// };

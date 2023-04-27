// import { reflection } from '../src/reflection.js';
// import { logr_expr_lang } from '../src/logr_exp_lang.js';
//
// describe('reflection, generator & Logr expression lang tests', () => {
//   it('should recursively generate data based on JSON primitive types and Logr expression language #ENUM', async () => {
//     const stringEnum = { a: '#ENUM["car", "dog"]' };
//
//     if (logr_expr_lang.isExpr(stringEnum.a)) {
//       const expr = logr_expr_lang.getExpr(stringEnum.a);
//       const generated = reflection.reflectAndGenerate(stringEnum);
//       expect(JSON.parse(expr.value)).toContain(
//         (generated as typeof stringEnum).a,
//       );
//     }
//
//     const numEnum = { a: '#ENUM[1, 2]' };
//
//     if (logr_expr_lang.isExpr(numEnum.a)) {
//       const expr = logr_expr_lang.getExpr(numEnum.a);
//       const generated = reflection.reflectAndGenerate(numEnum);
//       expect(JSON.parse(expr.value)).toContain((generated as typeof numEnum).a);
//     }
//   }),
//     it('should recursively generate data based on JSON primitive types and Logr expression language #EXACT', async () => {
//       const exactString = { a: '#EXACT["car"]' };
//
//       if (logr_expr_lang.isExpr(exactString.a)) {
//         const expr = logr_expr_lang.getExpr(exactString.a);
//         const generated = reflection.reflectAndGenerate(exactString);
//         expect((generated as typeof exactString).a).toBe(
//           JSON.parse(expr.value)[0],
//         );
//         expect((generated as typeof exactString).a).toBe('car');
//       }
//     });
// });

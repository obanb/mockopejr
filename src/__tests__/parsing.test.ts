//
// // test meant as a playground, not continuous integration
//
// import { templates } from '../gpt/templates.js';
// import { reflection } from '../parsing/reflection.js';
//
// jest.setTimeout(100000)
//
// describe('GPT playground tests', () => {
//   it('generate json with default template', async() => {
//
//     const json = await templates.generateJSON([{a: "Prague", b: "Želivského 805", c: "Letadlo"},{a: "Praha", b: "5th Avenue", c: "Ship"},] );
//
//     // const test = await Promise.all(Array.from({length: 10}).map(async() => {
//     //    return templates.generateJSON({a: "Prague", b: "Želivského 805", c: "Letadlo"}, );
//     // }))
//
//     expect(test).toBeDefined()
//
//     expect(json).toBeDefined()
//   });
//   it('generate json www default template', async() => {
//
//     const json = {
//       "stringPrimitive": "This is a string",
//       "numberPrimitive": 12345,
//       "booleanPrimitive": true,
//       "nullPrimitive": null,
//       "emptyObject": {},
//       "nestedObject": {
//         "nestedString": "Nested string here",
//         "nestedNumber": 67890,
//         "nestedBoolean": false,
//         "nestedNull": null
//       },
//       "arrayOfPrimitives": [1, "string", true, null, 3.14],
//       "arrayOfObjects": [
//         {
//           "name": "Alice",
//           "age": 28,
//           "isActive": true
//         },
//         {
//           "name": "Bob",
//           "age": 32,
//           "isActive": false
//         }
//       ],
//       "arrayOfArrays": [
//         [{
//           "name": "Alice",
//           "age": 28,
//           "isActive": true
//         }],
//         [{
//           "name": "Bob",
//           "age": 32,
//           "isActive": false
//         }]
//       ]
//     }
//
//
//
//
//     const vec = reflection.reflectAndGenerate(json)
//
//     expect(vec).toBeDefined()
//     expect(test).toBeDefined()
//
//     expect(json).toBeDefined()
//   });
// });

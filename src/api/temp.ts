// import * as http from 'http';
// import { RouterTable } from './types.js';
// import { IncomingMessage, ServerResponse } from 'http';
// import { getUrlPath, routing } from './routing.js';
// import { parseRequestParams } from 'graphql-http/lib/use/http';
// import { parse, print  } from 'graphql';
// import { graphqlAst } from '../parsing/graphqlAst.js';
//
// const extractKeys = (queryString: string) => {
//   // Remove all line breaks and extra spaces
//   const cleanedQuery = queryString.replace(/\s+/g, ' ');
//
//   // Find all words in the string that are not enclosed in parentheses
//   const matches = cleanedQuery.match(/([a-zA-Z_]\w*)(?![^\(]*\))/g);
//
//   // Remove duplicates (if any)
//   const uniqueMatches: string[] = Array.from(new Set(matches));
//
//   return uniqueMatches;
// }
//
//
// const _new = (
//   options: { port: number; desc?: string },
//   defaultRouterTable: RouterTable,
// ) => {
//   let routeState = {...defaultRouterTable.http, ...defaultRouterTable.graphql};
//
//   const route = (req: IncomingMessage, res: ServerResponse) => {
//     const method = req.method.toLowerCase();
//
//
//     const params = routing.getQueryParams(req.url)
//     const paramsPairs = routing.getQueryParamsPairs(params)
//
//     // retrieves the current keys each time it is routed
//     const routeKeys = Object.keys(routeState);
//     const path = getUrlPath(req.url);
//     const key = `${method}${path}`;
//
//     const found = routeKeys.find((r) => r === key);
//
//     if (found) {
//       switch (method) {
//         case 'get': {
//           routeState[key](req, res, {}, paramsPairs);
//           return;
//         }
//         case 'post': {
//           let body = '';
//
//
//           if(key === 'post/mirror' && paramsPairs.type === 'graphql'){
//             parseRequestParams(req, res).then((gqlRp) => {
//               const ast = parse(gqlRp.query)
//
//               const jsonTree = {}
//
//               graphqlAst.toJson(ast, jsonTree)
//
//               console.log("JSON_STRUCTURE", JSON.stringify(jsonTree, null, 2))
//
//               console.log('PRINT', print(ast))
//
//
//               const keys = extractKeys(gqlRp.query)
//               routeState['post/mirror'](req, res, jsonTree, gqlRp.query, paramsPairs, keys)
//               return
//             }).catch((e) => {console.log("error", JSON.stringify(e))})
//             return
//           }
//
//
//           if(key === 'post/graphqlProxy' || key === 'get/graphqlProxy'){
//             parseRequestParams(req, res).then((gqlRp) => {
//               const keys = extractKeys(gqlRp.query)
//
//               return
//             }).catch((e) => {console.log("error", JSON.stringify(e))})
//             return
//           }
//
//
//           req.on('data', (chunk) => {
//             body += chunk.toString();
//           });
//           req.on('end', () => {
//             const parsedbody = JSON.parse(body);
//             routeState[key](req, res, parsedbody, paramsPairs).catch((e) => {
//               res.writeHead(400);
//               console.log('msg')
//               console.log(e.message)
//               res.end(e.message);
//               return
//             });
//           });
//           return;
//         }
//         default: {
//           res.writeHead(422);
//           res.end('not supported http method');
//           return;
//         }
//       }
//     }
//
//     res.writeHead(404);
//     res.end();
//     return;
//   };
//
//   const srv = http.createServer((req: IncomingMessage, res: ServerResponse) => {
//     try {
//       route(req, res);
//     } catch (e) {
//       res.writeHead(500);
//       res.end(e.message);
//     }
//   });
//
//   return {
//     run: () => {
//       srv.listen(options.port);
//       console.log(
//         'plugable server ' + options.desc + ' running on port: ' + options.port,
//       );
//     },
//     close: () => srv.close(),
//     plug: (
//       method: 'POST' | 'GET',
//       uri: string,
//       httpHandler: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
//     ) => {
//       routeState[`${method.toLowerCase()}/` + uri] = httpHandler;
//     },
//     unplug: (uri: string) => {
//       delete routeState[uri];
//     },
//     reset: () => {
//       // keep only fixed graphql routes
//       routeState = {...defaultRouterTable.graphql};
//     },
//     exists: (uri: string) => !!routeState[uri],
//     info: () => ({
//       routes: Object.keys(routeState),
//     }),
//     setRouter: (routerTable: RouterTable) => {
//       // rewrite all routes
//       routeState = {...routerTable.http, ...routerTable.graphql}
//     },
//     _getRoutes: () => routeState,
//   };
// };
//
// export const plugableServer = {
//   new: _new,
// };

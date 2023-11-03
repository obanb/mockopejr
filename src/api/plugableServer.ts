import * as http from 'http';
import { RouterTable } from './types.js';
import { IncomingMessage, ServerResponse } from 'http';
import { getUrlPath, routing } from './routing.js';
import { parseRequestParams } from 'graphql-http/lib/use/http';
import { parse, visit } from 'graphql';

const extractKeys = (queryString: string) => {
  // Remove all line breaks and extra spaces
  const cleanedQuery = queryString.replace(/\s+/g, ' ');

  // Find all words in the string that are not enclosed in parentheses
  const matches = cleanedQuery.match(/([a-zA-Z_]\w*)(?![^\(]*\))/g);

  // Remove duplicates (if any)
  const uniqueMatches: string[] = Array.from(new Set(matches));

  return uniqueMatches;
}


const _new = (
  options: { port: number; desc?: string },
  defaultRouterTable: RouterTable,
) => {
  // just for clarity
  let routeState = defaultRouterTable;

  const route = (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method.toLowerCase();


    const params = routing.getQueryParams(req.url)
    const paramsPairs = routing.getQueryParamsPairs(params)

    // retrieves the current keys each time it is routed
    const routeKeys = Object.keys(routeState);
    const path = getUrlPath(req.url);
    const key = `${method}${path}`;

    const found = routeKeys.find((r) => r === key);

    if (found) {
      switch (method) {
        case 'get': {
          routeState[key](req, res, {}, paramsPairs);
          return;
        }
        case 'post': {
          let body = '';


          if(key === 'post/graphql' || key === 'get/graphql'){
            parseRequestParams(req, res).then((d) => {
             const parsed = parse(d.query)




              const selectionSet0 = parsed.definitions[0]["selectionSet"]
              const selections = selectionSet0["selections"]

              const deep =  selections[0]["selectionSet"]["selections"]

              console.log("deep", JSON.stringify(deep))

              const withArgs = deep.filter((s) => s["arguments"].length > 0)

              console.log("withArgs", withArgs)

              const ar = withArgs.reduce((acu, next) => {
                const args = next["arguments"]


                args.forEach((a) => {
                  const name = a["name"]["value"]
                  const value = a["value"]["value"]
                  acu = {...acu, [name]: value}
                })

                return acu
              },{})

              console.log("AR",ar)

              // const args = withArgs.arguments.reduce((acu, next) => {
              //     return {...acu, [next.name.value]: next.value.value}
              // }, {})

              // console.log("args", args)

              const keys = extractKeys(d.query)
              routeState['post/graphql'](res, keys, paramsPairs)
            }).catch((e) => {console.log("error", JSON.stringify(e))})
            return
          }


          req.on('data', (chunk) => {
            body += chunk.toString();
          });
          req.on('end', () => {
              const parsedbody = JSON.parse(body);
              routeState[key](req, res, parsedbody, paramsPairs).catch((e) => {
                res.writeHead(400);
                console.log('msg')
                console.log(e.message)
                res.end(e.message);
                return
              });
          });
          return;
        }
        default: {
          res.writeHead(422);
          res.end('not supported http method');
          return;
        }
      }
    }

    res.writeHead(404);
    res.end();
    return;
  };

  const srv = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    try {
      route(req, res);
    } catch (e) {
      res.writeHead(500);
      res.end(e.message);
    }
  });

  return {
    run: () => {
      srv.listen(options.port);
      console.log(
        'plugable server ' + options.desc + ' running on port: ' + options.port,
      );
    },
    close: () => srv.close(),
    plug: (
      method: 'POST' | 'GET',
      uri: string,
      httpHandler: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
    ) => {
      routeState[`${method.toLowerCase()}/` + uri] = httpHandler;
    },
    unplug: (uri: string) => {
      delete routeState[uri];
    },
    reset: () => {
      routeState = {...routeState, http: {}};
    },
    exists: (uri: string) => !!routeState[uri],
    info: () => ({
      routes: Object.keys(routeState),
    }),
    setRouter: (routerTable: RouterTable) => {
      routeState = routerTable;
    },
    _getRoutes: () => routeState,
  };
};

export const plugableServer = {
  new: _new,
};

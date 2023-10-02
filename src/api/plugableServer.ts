import * as http from 'http';
import { RouterTable } from './types.js';
import { IncomingMessage, ServerResponse } from 'http';
import { getUrlPath } from './routing.js';
import { parseRequestParams } from 'graphql-http/lib/use/http';

function extractKeys(queryString) {
  // Remove all line breaks and extra spaces
  const cleanedQuery = queryString.replace(/\s+/g, ' ');

  // Find all words in the string that are not enclosed in parentheses
  const matches = cleanedQuery.match(/([a-zA-Z_]\w*)(?![^\(]*\))/g);

  // Remove duplicates (if any)
  const uniqueMatches = Array.from(new Set(matches));

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

    // retrieves the current keys each time it is routed
    const routeKeys = Object.keys(routeState);
    const path = getUrlPath(req.url);
    const key = `${method}${path}`;

    const found = routeKeys.find((r) => r === key);


    if (found) {
      switch (method) {
        case 'get': {
          routeState[key](req, res, {});
          return;
        }
        case 'post': {
          let body = '';


          if(key === 'post/graphql' || key === 'get/graphql'){
            parseRequestParams(req, res).then((d) => {
              console.log(d.query)
              const keys = extractKeys(d.query)
              res.end(JSON.stringify(keys))
            }).catch((e) => {console.log("error", JSON.stringify(e))})
            return
          }


          req.on('data', (chunk) => {
            body += chunk.toString();
          });
          req.on('end', () => {
              const json = JSON.parse(body);
              routeState[key](req, res, json).catch((e) => {
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
      routeState = {};
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

import * as http from 'http';
import { RouterTable } from './types.js';
import { IncomingMessage, ServerResponse } from 'http';
import { getUrlPath } from './routing.js';

const _new = (options: {port: number, desc?: string}, defaultRouterTable: RouterTable) => {
  const serverStatus = 'IDLE'

  // just for clarity
  let routeState = defaultRouterTable

  const route = (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method.toLowerCase();

    // retrieves the current keys each time it is routed
    const routeKeys = Object.keys(routeState);

    for (const route of routeKeys) {
      const path = getUrlPath(req.url);
      const key = `${method}${path}`;
      if (key === route) {
        if (method === 'get') {
          routeState[key](req, res, {});
          break;
        } else if (method === 'post') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            const json = JSON.parse(body);
            routeState[key](req, res, json);
          });
          break;
        } else {
          res.writeHead(404);
          res.end('not supported http method');
          break;
        }
      }else {
        console.log('todo')
      }
      res.writeHead(404);
      res.end('url not found');
    }
  }

  const srv = http.createServer( (req: IncomingMessage, res: ServerResponse) => {
    try {
      route(req, res)
    } catch (e) {
      res.writeHead(500);
      res.end(e.message);
    }
  })


  return ({
    run: (routerTable?: RouterTable) => {
      if(serverStatus !== 'IDLE'){
        console.log(`server cannot be started from the state: ${serverStatus}`)
      }
      if(routerTable){
        routeState = routerTable
      }
      srv.listen(options.port)
      console.log("plugable server " + options.desc + " running on port: " + options.port)
    },
    close: () => srv.close(),
    plug: (method: 'POST' | 'GET', uri: string, httpHandler: (req: IncomingMessage, res: ServerResponse) => void) => {
      const httpMethod = method === 'GET' ? 'get' : 'post'
      routeState[`${httpMethod}/` + uri] = httpHandler
    },
    unplug: (uri: string) => {
      delete routeState[uri]
    },
    reset: () => {
      routeState = {}
    },
    info: () => ({
      status: serverStatus,
      routes: Object.keys(routeState),
    }),
    _getRoutes: () => routeState,
  })
}

export const plugableServer = {
  new: _new
}

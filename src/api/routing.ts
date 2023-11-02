import { IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';
import { RouterTable } from './types.js';

export const getUrlPath = (uri: string) => url.parse(uri).pathname;

const getQueryParams = (uri: string) => {
  const path = url.parse(uri).path;
  const results = path.match(/\?(?<query>.*)/);
  const {
    groups: { query },
  } = results;
  const params = query.match(/(?<param>\w+)=(?<value>\w+)/g);
  return params;
};

const getQueryParamsPairs = (params: string[]): Record<string, unknown> => {
  const pairs = params.reduce((acc, next) => {
    const [param, value] = next.split('=');
    acc[param] = value;
    return acc;
  }, {});

  return pairs;
};

const createRouter = (routerTable: RouterTable) => {
  const routes = Object.keys(routerTable);

  return {
    route: (req: IncomingMessage, res: ServerResponse) => {
      const method = req.method.toLowerCase();

      let found = false;
      for (const route of routes) {
        const path = getUrlPath(req.url);
        const key = `${method}${path}`;

        if (key === route) {
          found = true;

          if (method === 'get') {
            routerTable[key](req, res, {});
            break;
          } else if (method === 'post') {
            let body = '';

            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              const json = JSON.parse(body);
              routerTable[key](req, res, json);
            });
            break;
          } else {
            res.writeHead(404);
            res.end('not supported http method');
            break;
          }
        }
      }

      if (!found) {
        res.writeHead(404);
        res.end('url not found');
      }
    },
  };
};

const requestListener =
  (router: { route: (req: IncomingMessage, res: ServerResponse) => void }) =>
    (req: IncomingMessage, res: ServerResponse) => {
      try {
        router.route(req, res);
      } catch (e) {
        res.writeHead(400);
        res.end(e.message);
      }
    };

export const routing = {
  getUrlPath,
  getQueryParamsPairs,
  getQueryParams,
  createRouter,
  requestListener,
};

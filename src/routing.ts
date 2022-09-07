import { IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';
import { Chart, ChartType, isCmd, isRunCmd, RouterTable } from './types.js';
import { json } from './json.js'

const _HTTP_CONTENT_TYPE = 'application/json';
const _HTTP_ENCODING = 'application/json';

const httpGateKeeper = (req: IncomingMessage) => {
  const contentType = req.headers['content-type'];
  if (!contentType.includes(_HTTP_CONTENT_TYPE)) {
    throw new Error('Unsupported content type header.');
  }

  const accept = req.headers['accept'];
  if (!accept.includes(_HTTP_ENCODING)) {
    throw new Error('Unsupported accept header.');
  }
};

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

const getQueryParamsPairs = (params: string[]) => {
  const pairs = params.reduce((acc, next) => {
    const [param, value] = next.split('=');
    acc[param] = value;
    return acc;
  }, {});

  return pairs;
};

const createRouter = (
  routerTable: RouterTable,
) => {
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
            // TODO
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
      httpGateKeeper(req);
      router.route(req, res);
    } catch (e) {
      res.writeHead(400);
      res.end(e.message);
    }
  };

const appRouterTable: RouterTable = {
  'get/info': (_, res) => {
    res.writeHead(200);
    res.end('ok');
  },
  'get/mirror': (_, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
  },
  'post/mirror': async (req, res, args) => {
    // reqHolder.mirror = {};
    // reqHolder.mirror['request'] = req;
    // reqHolder.mirror['body'] = args;

    const date = new Date();
    const fileName = `mirror_${date.getFullYear()}${
      date.getMonth() + 1
    }${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

    const chart: Chart = {
      schema: args,
      headers: req.headers,
      type: ChartType.UNKNOWN,
    };

    await json.writeChart(fileName, chart);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(""));
  },
  'post/cmd': (_, res, args) => {
    if (isCmd(args)) {
      if (isRunCmd(args)) {
        console.log('shit')
      }
    }

    res.writeHead(200);
    res.end('ok');
  },
  'post/apply': (_, res) => {
    res.writeHead(200);
    res.end('ok');
  },
  'post/reload': (_, res) => {
    res.writeHead(200);
    res.end('ok');
  },
};


const proxyRouterTable: RouterTable = {
  'get/mirror': (_, res, args) => {
    console.log(`mirroring body: ${JSON.stringify(args)}`);
    res.writeHead(200);
    res.end('ok');
  },
};

const chartRouterTable: RouterTable = {}

export const routing = {
  getUrlPath,
  getQueryParamsPairs,
  getQueryParams,
  httpGateKeeper,
  createRouter,
  requestListener,
  appRouterTable,
  proxyRouterTable,
  chartRouterTable
};

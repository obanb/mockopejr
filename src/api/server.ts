import {Server} from 'node:http';
import express, {Router, Request, Response} from 'express';
import { JsonGraphQLChart, RequestCfg } from '../core/types.js';
import { json } from '../core/json.js';
import { chart } from '../core/chart.js';
import { parseRequestParams } from 'graphql-http/lib/use/express';

const app = express();
const port = process.env.APP_PORT;

const RESERVED_ROUTES = {
  GRAPHQL: '/graphql',
  HEALTHZ: '/healthz',
}
const GRAPHQL_ROUTE = RESERVED_ROUTES.GRAPHQL;

const router = async() => {
  const expressRouter = Router();
  const reservedUrls = Object.values(RESERVED_ROUTES);
  expressRouter.get(RESERVED_ROUTES.HEALTHZ,(req: Request, res: Response) => {
    res.sendStatus(200)
  });
  const charts = await json.read()
  const graphlCharts = Object.values(charts).filter((c): c is JsonGraphQLChart => c.type === 'graphql');
  expressRouter.all(GRAPHQL_ROUTE, async(req: Request, res: Response) => {
     const gqlParams = await parseRequestParams(req, res)
    console.log(gqlParams)
     const gqlKeys = extractGqlKeys(gqlParams.query);
     const body = await chart.resolveGraphqlChart(gqlKeys, graphlCharts);
     res.send(body);
  })
  // load all JSON charts from folder
  for (const [_, v] of Object.entries(charts)) {
    // if chart is http then hook it up to the express router
    // if chart is graphql then ignore it, graphql charts are computed online from file via different mechanism
    if(v.type === 'http') {
      const method = v.method.toLowerCase();
      if (typeof expressRouter[method] === 'function' && !reservedUrls.includes(v.url)) {
        expressRouter[method](v.url, async (req: Request, res: Response) => {
          const onlineQueries = readCfgQueries(req)
          await applyOnlineQueries(onlineQueries, res);
          if(res.statusCode >= 400){
            res.sendStatus(res.statusCode)
            return;
          }
          const body = await chart.serverHttpChart(v)
          res.send(body);
        });
      }
    }
  }
  return expressRouter
}


const extractGqlKeys = (queryString: string): string[] => {
  // Remove all line breaks and extra spaces
  const cleanedQuery = queryString.replace(/\s+/g, ' ');

  // Find all words in the string that are not enclosed in parentheses
  const matches = cleanedQuery.match(/([a-zA-Z_]\w*)(?![^\(]*\))/g);

  return matches;
}

const applyOnlineQueries = (cfg: RequestCfg, res: Response) => {
  if(cfg.errorCode){
    res.status(cfg.errorCode);
  }

  if(cfg.delayMs){
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(void 0);
      }, cfg.delayMs);
    });
  }

  return Promise.resolve();
}

const readCfgQueries = (req: Request): RequestCfg => {
  const query = req.query;
  let cfg: RequestCfg = {}
  if(query.errorCode && typeof query.errorCode === 'string'){
    cfg.errorCode = Number(query.errorCode);
  }
  if(query.delayMs && typeof query.delayMs === 'string'){
    cfg.delayMs = Number(query.delayMs);
  }
  return cfg;
}

export const startServer = async () => {
   await new Promise<Server>((resolve) => {
    const httpServer = app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
      resolve(httpServer);
    });
  });
  app.use(express.json({limit: '50mb'}));
  app.use(await router());
};

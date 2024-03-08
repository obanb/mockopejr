import {Server} from 'node:http';
import express, {Router, Request, Response} from 'express';
import { RequestCfg } from '../core/types.js';
import { json } from '../core/json.js';
import { chart } from '../core/chart';

const app = express();
const port = process.env.APP_PORT;

const RESERVED_ROUTES = {
  GRAPHQL: '/graphql',
  HEALTHZ: '/healthz',
}
const GRAPHQL_ROUTE = RESERVED_ROUTES.GRAPHQL;

const router = async() => {
  const expressRouter = Router();
  expressRouter.get(RESERVED_ROUTES[0],(req: Request, res: Response) => {
    res.sendStatus(200)
  });
  expressRouter.all(GRAPHQL_ROUTE, (req: Request, res: Response) => {

  })
  // load all JSON charts from folder
  const charts = await json.read()
  for (const [_, v] of Object.entries(charts)) {
    // if chart is http then hook it up to the express router
    // if chart is graphql then ignore it, graphql charts are computed online from file via different mechanism
    if(v.type === 'http') {
      const method = v.method.toLowerCase();
      if (typeof expressRouter[method] === 'function') {
        expressRouter[method](v.url, async (req: Request, res: Response) => {
          const body = await chart.serverHttpChart(v)
          res.send(body);
        });
      }
    }
  }
  return expressRouter
}

const readSpecialRequestQueries = (req: Request): RequestCfg => {
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

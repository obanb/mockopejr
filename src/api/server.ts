import {Server} from 'node:http';
import express, { Router, Request, Response, NextFunction } from 'express';
import { JsonGraphQLChart, RequestCfg } from '../core/types.js';
import { json } from '../core/json.js';
import { chart } from '../core/chart.js';
import { parseRequestParams } from 'graphql-http/lib/use/express';
import { expressionParser } from '../parsing/expression_parser';

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
  const charts = await json.read()
  const graphlCharts = Object.values(charts).filter((c): c is JsonGraphQLChart => c.type === 'graphql');

  // apply online wildcards on each response per request params
  expressRouter.all("*",async(req: Request, res: Response, next: NextFunction) => {
    const wildcards = getQueryWildcards(req)
    await applyWildcards(wildcards, res);
    if(res.statusCode >= 400){
      res.sendStatus(res.statusCode)
      return;
    }
    next()
  })
  expressRouter.get(RESERVED_ROUTES.HEALTHZ,(req: Request, res: Response) => {
    res.sendStatus(200)
  });
  // HOF of expression parser
  const parser = expressionParser._new({leftParen: {
      type: 'SYMBOL',
      subtype: 'LEFT_PAREN',
      match: /\(/,
      value: '(',
    },
    rightParen: {
      type: 'SYMBOL',
      subtype: 'RIGHT_PAREN',
      match: /\)/,
      value: ')',
    }})
  expressRouter.all(GRAPHQL_ROUTE, async(req: Request, res: Response) => {
     const gqlParams = await parseRequestParams(req, res)
    // fuck'em
    if(gqlParams.operationName === 'IntrospectionQuery'){
      res.sendStatus(200)
      return;
    }
    console.log(gqlParams)
     const gqlKeys = extractGqlKeys(gqlParams.query);
     const body = await chart.resolveGraphqlChart(parser.proceed, gqlKeys, graphlCharts);
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
          const body = await chart.serverHttpChart(parser.proceed, v)
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

const applyWildcards = (wilrdcards: RequestCfg, res: Response) => {
  if(wilrdcards.errorCode){
    res.status(wilrdcards.errorCode);
  }

  if(wilrdcards.delayMs){
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(void 0);
      }, wilrdcards.delayMs);
    });
  }

  return Promise.resolve();
}

const getQueryWildcards = (req: Request): RequestCfg => {
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

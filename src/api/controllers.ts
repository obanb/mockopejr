import { charts } from '../core/charts.js';
import { RouterTable } from './types.js';
import { json } from '../core/json.js';
import { Chart, ChartType } from '../core/types.js';
import { validateCmd } from './validations.js';


const appController = (
  chartGroup: ReturnType<typeof charts.group>,
): RouterTable => ({
  graphql: {
    'post/graphqlDispatch': async(req, res, originalQuery, jsonTree, keys, params) => {
      console.log("GRAPHQL INNER POST KEYS", keys)

      await charts.fromGraphqlRequest(chartGroup)(req, originalQuery, jsonTree, keys, ChartType.HTTP_DISPATCH);

      res.writeHead(200)
      res.end(JSON.stringify({graphql: true}))
    },
  },
  http: {
    'post/mirror': async (req, res, args, params) => {
       res.end(JSON.stringify({ params }));
       const {kind, apiType} = params

       if(apiType === 'http'){
         switch(kind){
            case 'get':
            case 'post':
            default:
              res.writeHead(400);
              res.end(JSON.stringify({ error:`unknown kind:${kind}} apiType:${apiType}`}));
              return
         }
       }

       else if(apiType === 'graphql'){
         switch(kind){
            case 'get':
            case 'post':
            default:
              res.writeHead(400);
              res.end(JSON.stringify({ error:`unknown kind:${kind} for apiType:${apiType}}`}));
              return
         }

       }
       res.writeHead(400);
       res.end(JSON.stringify({ error:`unknown apiType:${apiType}}`}));
    },
    'post/graphql': async(_, res, args) => {
      console.log("BODY", JSON.stringify(args))
      res.writeHead(200);
      res.end(JSON.stringify({ graphqlpost:true }));
    },
    'get/graphql': async(_, res) => {
      res.writeHead(200);
      res.end(JSON.stringify({ graphqlget:true }));
    },
    'get/charts': async(_, res) => {
      res.writeHead(200);
      res.end(JSON.stringify({ charts: chartGroup.list() }));
    },
    'post/charts/reload': async (_, res) => {
      res.writeHead(200);
      await json.readCharts();
      res.end('ok');
    },
    'post/mirror/get': async (req, res, args) => {
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
      res.end(JSON.stringify(''));
    },
    'post/mirror/post': async (req, res, args) => {
      await charts.fromRequest(chartGroup)(req, args, ChartType.HTTP_DISPATCH);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(''));
    },
    'post/mirror/proxy/get': async (req, res, args) => {
      await charts.fromRequest(chartGroup)(req, args, ChartType.HTTP_HOOK);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(''));
    },
    'post/mirror/proxy/post': async (req, res, args) => {
      await charts.fromRequest(chartGroup)(req, args, ChartType.HTTP_DISPATCH);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(''));
    },
    'post/cmd': async (_, res, args) => {

      validateCmd(args)

      const exec = await chartGroup.cmd(args);

      res.writeHead(200);
      res.end(JSON.stringify(exec));
    },
  }
});

export const controllers = {
  appController,
};

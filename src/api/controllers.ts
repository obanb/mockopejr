import { charts } from '../core/charts.js';
import { isGraphqlMirrorRequest, isHttpMirrorRequest, RouterTable } from './types.js';
import { json } from '../core/json.js';
import { Chart, ChartType } from '../core/types.js';
import {
  assertIsGraphqlMirrorRequest, assertIsHttpMirrorRequest,
  assertIsMirrorRequest,
  validateCmd,
} from './validations.js';


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
      try {
        assertIsMirrorRequest(params)

        // graphql segment
        if(params.type === 'graphql'){
          assertIsGraphqlMirrorRequest(params)

          if(params.method === 'query'){
            res.writeHead(200);
            res.end(JSON.stringify({ graphqlquery:true }));
            return
          }

          if(params.method === 'mutation'){
            res.writeHead(200);
            res.end(JSON.stringify({ graphqlmutation:true }));
            return
          }
        }

        // http segment
        if(params.type === 'http'){
          assertIsHttpMirrorRequest(params)

          if(params.method === 'get'){
            res.writeHead(200);
            res.end(JSON.stringify({ httpget:true }));
            return
          }

          if(params.method === 'post'){
            res.writeHead(200);
            res.end(JSON.stringify({ httppost:true }));
            return
          }
        }
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
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

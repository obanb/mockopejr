import { Chart, ChartType, isCmd, isRunCmd, RouterTable } from './types.js';
import { json } from './json.js';
import { charts } from './charts.js';
import { plugableServer } from './plugableServer.js';
import { channel } from './channel.js';

const appRouterTable = (chartServer: ReturnType<typeof plugableServer.new>, channelGroup: ReturnType<typeof channel.group>): RouterTable => ({
  'get/info': (_, res) => {
    res.writeHead(200);
    res.end('ok');
  },
  'get/mirror': (_, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
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
    res.end(JSON.stringify(""));
  },
  'post/mirror/post': async (req, res, args) => {
    await charts.fromRequest(chartServer, channelGroup)(req, args, ChartType.GET)

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(""));
  },
  'post/mirror/proxy/get': async (req, res, args) => {
    await charts.fromRequest(chartServer, channelGroup)(req, args, ChartType.GET)

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(""));
  },
  'post/mirror/proxy/post': async (req, res, args) => {
    await charts.fromRequest(chartServer, channelGroup)(req, args, ChartType.GET)

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
});


const proxyRouterTable: RouterTable = {
  'post/mirror': (_, res, args) => {
    console.log(`mirroring body: ${JSON.stringify(args)}`);
    res.writeHead(200);
    res.end('ok');
  },
};

const chartRouterTable: RouterTable = {}

export const routerTables = {
  appRouterTable,
  proxyRouterTable,
  chartRouterTable
}

import { charts } from '../core/charts.js';
import { Chart, ChartType, RouterTable } from '../types.js';
import { json } from '../core/json.js';


const appController = (
  chartGroup: ReturnType<typeof charts.group>,
): RouterTable => ({
  'get/info': (_, res) => {
    res.writeHead(200);
    res.end(JSON.stringify({ charts: chartGroup.list() }));
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
    res.end(JSON.stringify(''));
  },
  'post/mirror/post': async (req, res, args) => {
    await charts.fromRequest(chartGroup)(req, args, ChartType.POST);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(''));
  },
  'post/mirror/proxy/get': async (req, res, args) => {
    await charts.fromRequest(chartGroup)(req, args, ChartType.GET);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(''));
  },
  'post/mirror/proxy/post': async (req, res, args) => {
    await charts.fromRequest(chartGroup)(req, args, ChartType.POST);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(''));
  },
  'post/cmd': async (_, res, args) => {
    // if (isCmd(args)) {
    console.log("ARGS", args)
    // TODO
    const r = await chartGroup.cmd(args.identifier as any, args as any);
    // }

    res.writeHead(200);
    res.end(JSON.stringify(r));
  },
  'post/apply': (_, res) => {
    res.writeHead(200);
    res.end('ok');
  },
  'post/reload': async (_, res) => {
    res.writeHead(200);
    await json.readCharts();
    res.end('ok');
  },
});

export const controllers = {
  appController,
};

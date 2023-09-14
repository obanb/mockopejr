import { charts } from '../core/charts.js';
import { RouterTable } from './types.js';
import { json } from '../core/json.js';
import { Chart, ChartType } from '../core/types.js';
import { validateCmd } from './validations.js';


const appController = (
  chartGroup: ReturnType<typeof charts.group>,
): RouterTable => ({
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

    validateCmd(args)

    const exec = await chartGroup.cmd(args);

    res.writeHead(200);
    res.end(JSON.stringify(exec));
  },
});

export const controllers = {
  appController,
};

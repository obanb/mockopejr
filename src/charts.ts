import { json } from './json.js';
import {
  Chart,
  ChartType,
  isGetChart,
  isPostChart,
} from './types.js';
import { reflection } from './reflection.js';
import { channelGroup, chartServer } from './main.js';
import { channel } from './channel.js';
import { httpUtils } from './httpUtils.js';
import { testUtils } from './testUtils.js';
import { IncomingMessage } from 'http';
import { utils } from './utils.js';


const reload = async () => {
  const charts = await json.readCharts();

  for (const chart of charts) {
    if (isGetChart(chart)) {
      addGetChart(chart);
    } else if (isPostChart(chart)) {
      addPostChart(chart);
    }
  }

  return charts;
};



const fromRequest = async(req: IncomingMessage, parsedBody: Record<string, unknown>, type: ChartType) => {
  const date = new Date()
  const fileName = `${type}_${date.getFullYear()}${
    date.getMonth() + 1
  }${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

  const chart: Chart = {
    schema: parsedBody,
    headers: req.headers,
    type,
  };

  await json.writeChart(fileName, chart);

  switch(type) {
    case ChartType.GET:

      const getChart: Chart<ChartType.GET> = {
        schema: parsedBody,
        headers: req.headers,
        type,
      };

      await addGetChart(getChart)

      return getChart

    case ChartType.POST:
      const postChart: Chart<ChartType.POST> = {
        schema: parsedBody,
        headers: req.headers,
        type,
      };

      await addPostChart(postChart)

      return chart

    case ChartType.UNKNOWN:
      return chart
    default:
      return utils.absurd<Chart>(type)
  }


}

const addGetChart =
  (chart: Chart<ChartType.GET>): void => {
  chartServer.plug('GET', chart.options.url,  (_, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (chart.options.buffer > 1) {
      const reflected = Array.from({length: chart.options.buffer}, () => reflection.reflectAndGenerate(chart.schema))
      res.end(JSON.stringify(reflected));
      return;
    } else {
      const reflected = reflection.reflectAndGenerate(chart.schema)
      res.end(JSON.stringify(reflected));
      return;
    }
  })
};

const addPostChart =
  async(chart: Chart<ChartType.POST>): Promise<void> => {
    console.log(chart);
    const reflected = Array.from({length: chart.options.buffer}, () => reflection.reflectAndGenerate(chart.schema))
    const chan = channel.new({callbackFn: () => httpUtils.post(`${testUtils.config.localhost}:${testUtils.config.chart.port}/mirror`, reflected)})
    await chan.init()
    channelGroup.add(chan)
  };

const list = () => json.readCharts();

export const charts = {
  addGetChart,
  addPostChart,
  reload,
  list,
  fromRequest
};

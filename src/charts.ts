import { json } from './json.js';
import {
  Chart,
  ChartType,
  isGetChart,
  isPostChart,
} from './types.js';
import { reflection } from './reflection.js';
import { chartServer } from './main.js';

const reload = async (channels: any[]) => {
  const charts = await json.readCharts();

  for (const chart of charts) {
    if (isGetChart(chart)) {
      addGetChart(chart);
    } else if (isPostChart(chart)) {
      addPostChart(channels)(chart);
    }
  }

  return charts;
};

const addGetChart =
  (chart: Chart<ChartType.GET>): void => {
  chartServer.plug('GET', 'get/' + chart.options.url,  (_, res) => {
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
  (channels: any[]) =>
  (chart: Chart<ChartType.POST>): void => {
    console.log(chart);
    console.log(channels);
  };

const list = () => json.readCharts();

export const charts = {
  addGetChart,
  addPostChart,
  reload,
  list,
};

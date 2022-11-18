import { json } from './json.js';
import { Chart, ChartType, Cmd, CmdType, isGetChart, isPostChart } from './types.js';
import { reflection } from './reflection.js';
import { channel } from './channel.js';
import { httpUtils } from './httpUtils.js';
import { IncomingMessage } from 'http';
import { utils } from './utils.js';
import { plugableServer } from './plugableServer.js';

const reload = (chartGroup: ReturnType<typeof group>) => async () => {
  const jsonCharts = await json.readCharts();

  await chartGroup.purge();

  for (const [chartName, chart] of Object.entries(jsonCharts)) {
    await chartGroup.add(chart, chartName);
  }

  return charts;
};

const computeChartName = async (type: ChartType) => {
  const date = new Date();
  const next = await json.getCount();

  const chartName = `${next}_${type}_${date.getFullYear()}${
    date.getMonth() + 1
  }${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

  return chartName;
};

const fromRequest =
  (chartGroup: ReturnType<typeof group>) =>
  async (
    req: IncomingMessage,
    parsedBody: Record<string, unknown>,
    type: ChartType,
  ) => {
    const fileName = await computeChartName(type);

    const chart: Chart = {
      schema: parsedBody,
      headers: req.headers,
      type,
    };

    await json.writeChart(fileName, chart);

    switch (type) {
      case ChartType.GET:
        const getChart: Chart<ChartType.GET> = {
          schema: parsedBody,
          headers: req.headers,
          type,
        };

        await chartGroup.add(getChart, fileName);

        return getChart;

      case ChartType.POST:
        const postChart: Chart<ChartType.POST> = {
          schema: parsedBody,
          headers: req.headers,
          type,
        };

        await chartGroup.add(postChart, fileName);

        return chart;

      case ChartType.UNKNOWN:
        return chart;
      default:
        return utils.absurd<Chart>(type);
    }
  };

const hookGetChart =
  (chartServer: ReturnType<typeof plugableServer.new>) =>
  (chart: Chart<ChartType.GET>): void => {
    chartServer.plug('GET', chart.options.url, (_, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (chart.options.buffer > 1) {
        const reflected = Array.from({ length: chart.options.buffer }, () =>
          reflection.reflectAndGenerate(chart.schema),
        );
        res.end(JSON.stringify(reflected));
        return;
      } else {
        const reflected = reflection.reflectAndGenerate(chart.schema);
        res.end(JSON.stringify(reflected));
        return;
      }
    });
  };

const hookPostChart = async (
  chart: Chart<ChartType.POST>,
): Promise<{ chan: ReturnType<typeof channel.new> }> => {
  console.log(chart);
  const reflected = Array.from({ length: chart.options.buffer }, () =>
    reflection.reflectAndGenerate(chart.schema),
  );
  const chan = channel.new({
    callbackFn: async () =>
      httpUtils.post(`${'http://127.0.0.1'}:${3032}/mirror`, reflected),
  });
  await chan.init();

  return {
    chan,
  };
};

const group = (chartServer: ReturnType<typeof plugableServer.new>) => {
  let charts: Record<
    string,
    { chart: Chart; channel?: ReturnType<typeof channel.new> }
  > = {};
  return {
    getByIdentifier: (identifier: string) => {
      let chartName = identifier;
      let chart = charts[chartName];

      if (!chart) {
        const keys = Object.keys(charts);
        chartName = keys.find((k) => k.includes(`${identifier}_`));
        chart = charts[chartName];
      }

      return chart
    },
    add: async (chart: Chart, chartName?: string) => {
      if (isGetChart(chart)) {
        const name = chartName ?? (await computeChartName(ChartType.GET));
        hookGetChart(chartServer)(chart);
        charts[name] = { chart };
      } else if (isPostChart(chart)) {
        const name = chartName ?? (await computeChartName(ChartType.POST));
        const { chan } = await hookPostChart(chart);
        charts[name] = { chart, channel: chan };
      }
    },
    purge: async () => {
      for (const [_, { chart, channel }] of Object.entries(charts)) {
        if (isGetChart(chart)) {
          chartServer.unplug(chart.options.url);
        } else {
          if (channel) {
            await channel.next({ type: CmdType.KILL });
          }
        }
      }
      charts = {};
    },
    delete: async (identifier: string) => {
      let chartName = identifier;
      let chart = charts[chartName];

      if (!chart) {
        const keys = Object.keys(charts);
        chartName = keys.find((k) => k.includes(`${identifier}_`));
        chart = charts[chartName];
      }

      if (!chart) {
        console.log(`no chart with identifier ${identifier} found`);
      }

      if (isGetChart(chart.chart)) {
        chartServer.unplug(chart.chart.options.url);
      } else {
        if (chart.channel) {
          await chart.channel.next({ type: CmdType.KILL });
        }
      }

      delete chart[chartName];
    },
    cmd: async (identifier: string, cmd: Cmd): Promise<{state: 'executed' | 'ignored' | 'forbidden',  msgs: string[]}> => {
      let chartName = identifier;
      let chart = charts[chartName];

      console.log("CHART PICO", charts)

      if (!chart) {
        const keys = Object.keys(charts);
        chartName = keys.find((k) => k.includes(`${identifier}_`));
        chart = charts[chartName];
      }

      if (!chart) {
        console.log(`no chart with identifier ${identifier} found`);
      }


      if(isPostChart(chart.chart)){
        const y = await chart.channel.next(cmd);
        if(y.done){
            return {state: 'ignored', msgs: ['command ignored - channel no longer active']}
        }else{
          return {state: 'executed', msgs: [`command {${cmd.type}} executed`, `actual channel state: value: {${y.value}}, done: ${y.done}`]}
        }
      }


      if(isGetChart(chart.chart)){
        const uri = chart.chart.options.url
        const route = chartServer.exists(uri)

        switch (cmd.type) {
          case CmdType.PAUSE:
          case CmdType.KILL:
            if(!route){
              return {state: 'executed', msgs: [`route {${uri}} not found, ignoring`]}
            }
            chartServer.unplug(uri);
            delete chart[chartName];
            return {state: 'executed', msgs: [`command {${cmd.type}} executed`]}
          case CmdType.RUN:
            if(route){
              return {state: 'executed', msgs: [`existing route {${uri}} found, replacing`,`creating route {${uri}}`]}
            }
            await hookGetChart(chartServer)(chart.chart);

            return {state: 'executed', msgs: [`creating route {${uri}}`]}
        }
      }

      return {state: 'forbidden', msgs: ["fe"]}

    },
    list: () => Object.keys(charts),
    get: () => charts,
  };
};


export const charts = {
  reload,
  fromRequest,
  hookGetChart,
  hookPostChart,
  group,
};

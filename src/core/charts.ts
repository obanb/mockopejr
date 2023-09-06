import { json } from './json.js';
import {
  Chart,
  ChartType,
  isGetChart,
  isPostChart,
} from './types.js';
import { channel } from './channel.js';
import { IncomingMessage } from 'http';
import { AxiosError } from 'axios';
import { reflection } from '../parsing/reflection.js';
import { httpUtils } from '../utils/httpUtils.js';
import { colourfulUnicorn } from '../utils/colourfulUnicorn.js';
import { commonUtils } from '../utils/commonUtils.js';
import { plugableServer } from '../api/plugableServer.js';
import { Cmd, CmdType, isRunCmd, RunCmd, RunCmdOptions } from '../api/types.js';


const reload = (chartGroup: ReturnType<typeof group>) => async () => {
  const jsonCharts = await json.readCharts();

 colourfulUnicorn.error(JSON.stringify(jsonCharts));

  await chartGroup.purge();

  for (const [chartName, chart] of Object.entries(jsonCharts)) {
    await chartGroup.add(chart, chartName);
  }

  colourfulUnicorn.prettyJson(chartGroup.list(), false, "reloaded charts");

  return charts;
};

const computeIdentifiers = async (type: ChartType) => {
  const date = new Date();
  const next = await json.getCount();

  const chartName = `${next}_${type}_${date.getFullYear()}${
    date.getMonth() + 1
  }${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

  const temporaryUrl = `${next}_${type}`;

  return { chartName, temporaryUrl };
};

const fromRequest =
  (chartGroup: ReturnType<typeof group>) =>
  async (
    req: IncomingMessage,
    parsedBody: Record<string, unknown>,
    type: ChartType,
  ) => {
    const { chartName: fileName } = await computeIdentifiers(type);

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
          options: {
            buffer: 1,
            url: null,
          },
        };

        await chartGroup.add(getChart, fileName);

        return getChart;

      case ChartType.POST:
        const postChart: Chart<ChartType.POST> = {
          schema: parsedBody,
          headers: req.headers,
          type,
          options: {
            perSec: 1,
            buffer: 1,
            url: null,
          },
        };

        await chartGroup.add(postChart, fileName);

        return chart;

      case ChartType.UNKNOWN:
        return chart;
      default:
        return commonUtils.absurd<Chart>(type);
    }
  };

const hookGetChart =
  (chartServer: ReturnType<typeof plugableServer.new>) =>
  async (chart: Chart<ChartType.GET>): Promise<void> => {
    const url =
      chart.options?.url ||
      (await computeIdentifiers(ChartType.GET)).temporaryUrl;

    chartServer.plug('GET', url, (_, res) => {
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

  const chan = channel.new({
    callbackFn: async (opts?: RunCmdOptions) => {
      const mergedOpts = { ...chart.options, ...opts };

      if (!mergedOpts.url || !mergedOpts.perSec) {
        throw new Error('The options ["url","perSec"] are mandatory, please define them in the JSON file of the corresponding charter or as part of a command.');
      }

      const reflected = Array.from({ length: mergedOpts?.buffer || 1 }, () =>
        reflection.reflectAndGenerate(chart.schema),
      );
      return httpUtils
        .post(
          mergedOpts.url,
          reflected,
        )
        .catch((e: AxiosError) => {
          console.log(e?.message);
          console.log(e?.response?.status);
          console.log(e?.response?.statusText);
        });
    },
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

      return chart;
    },
    add: async (chart: Chart, chartName?: string) => {
      console.log(`(re)creating chart "${chartName}"`);
      if (isGetChart(chart)) {
        const name =
          chartName ?? (await computeIdentifiers(ChartType.GET)).chartName;
        hookGetChart(chartServer)(chart);
        charts[name] = { chart };
      } else if (isPostChart(chart)) {
        const name =
          chartName ?? (await computeIdentifiers(ChartType.POST)).chartName;
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
            await channel.next({ type: CmdType.KILL, identifier: "_" });
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
          await chart.channel.next({ type: CmdType.KILL, identifier: "_" });
        }
      }

      delete chart[chartName];
    },
    cmd: async (
      cmd: Cmd,
    ): Promise<{
      state: 'executed' | 'ignored' | 'forbidden';
      msgs: string[];
    }> => {
      const identifier = cmd.identifier

      let chartName = identifier;

      // first try, direct match
      let chart = charts[chartName];

      if (!chart) {
        // second try, partial match
        const keys = Object.keys(charts);
        chartName = keys.find((k) => k.includes(`${identifier}_`));
        chart = charts[chartName];
      }


      if (!chart) {
        console.log(`no chart with identifier ${identifier} found`);
      }

      if (isPostChart(chart.chart)) {
        if(isRunCmd(cmd)){
          validateRunCmdOptions(chart.chart, cmd);
        }

        const y = await chart.channel.next(cmd);
        if (y.done) {
          return {
            state: 'ignored',
            msgs: ['command ignored - channel no longer active'],
          };
        } else {
          return {
            state: 'executed',
            msgs: [
              `command {${cmd.type}} executed`,
              `actual channel state: value: {${y.value}}, done: ${y.done}`,
            ],
          };
        }
      }

      if (isGetChart(chart.chart)) {
        const uri = chart.chart.options.url;
        const route = chartServer.exists(uri);

        switch (cmd.type) {
          case CmdType.PAUSE:
          case CmdType.KILL:
            if (!route) {
              return {
                state: 'executed',
                msgs: [`route {${uri}} not found, ignoring`],
              };
            }
            chartServer.unplug(uri);
            delete chart[chartName];
            return {
              state: 'executed',
              msgs: [`command {${cmd.type}} executed`],
            };
          case CmdType.RUN:
            if (route) {
              return {
                state: 'executed',
                msgs: [
                  `existing route {${uri}} found, replacing`,
                  `creating route {${uri}}`,
                ],
              };
            }
            await hookGetChart(chartServer)(chart.chart);

            return { state: 'executed', msgs: [`creating route {${uri}}`] };
        }
      }

      return { state: 'forbidden', msgs: ['fe'] };
    },
    list: () => Object.keys(charts),
    get: () => charts,
  };
};



const validateRunCmdOptions = (chart: Chart<ChartType.POST>, cmd: RunCmd) => {
  const mergedOpts = { ...chart.options, ...cmd.options };

  if(!mergedOpts.perSec || !mergedOpts.url) {
    throw new Error('perSec and url are mandatory in a JSON chart definition or command options');
  }
}


export const charts = {
  reload,
  fromRequest,
  hookGetChart,
  hookPostChart,
  group,
};

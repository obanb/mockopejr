import { json } from './json.js';
import {
  Chart,
  ChartType, isGraphqlDispatchChart, isGraphqlHookChart,
  isHttpDispatchChart,
  isHttpHookChart,
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



const fromGraphqlRequest =
  (chartGroup: ReturnType<typeof group>) =>
    async (
      req: IncomingMessage,
      originalQuery: string,
      schema: Record<string, unknown>,
      keys: string[],
      type: ChartType,
    ) => {
      const { chartName: fileName } = await computeIdentifiers(type);

      const chart: Chart<ChartType.GRAPHQL_DISPATCH> = {
        originalQuery,
        schema,
        headers: req.headers,
        type: ChartType.GRAPHQL_DISPATCH,
      };

      await json.writeChart(fileName, chart);

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
      case ChartType.HTTP_HOOK:
        const getChart: Chart<ChartType.HTTP_HOOK> = {
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

      case ChartType.HTTP_DISPATCH:
        const postChart: Chart<ChartType.HTTP_DISPATCH> = {
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


      case ChartType.GRAPHQL_HOOK:
        const graphqlChart: Chart<ChartType.GRAPHQL_HOOK> = {
          headers: req.headers,
          schema: ["pes"] as any,
          type,
          options: {
            keys: [],
            buffer: 1,
          },
        };

        await chartGroup.add(graphqlChart, fileName);

        return chart;


      case ChartType.GRAPHQL_DISPATCH:
        const graphqlDispatchChart: Chart<ChartType.GRAPHQL_DISPATCH> = {
          headers: req.headers,
          schema: ["pes"] as any,
          type,
          options: {
            perSec: 1,
            url: null,
          }
        }

        await chartGroup.add(graphqlDispatchChart, fileName);

        return chart;



      case ChartType.UNKNOWN:
        return chart;
      default:
        // absurd helper for static exhaustive switch
        return commonUtils.absurd<Chart>(type);
    }
  };

const hookGetChart =
  (chartServer: ReturnType<typeof plugableServer.new>) =>
  async (chart: Chart<ChartType.HTTP_HOOK>): Promise<void> => {
    const url =
      chart.options?.url ||
      (await computeIdentifiers(ChartType.HTTP_HOOK)).temporaryUrl;

    chartServer.plug('GET', url, async (_, res) => {
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
  chart: Chart<ChartType.HTTP_DISPATCH>,
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
    // adds the chart to the in memory state, where it becomes accessible for http/CLI commands
    add: async (chart: Chart, chartName?: string) => {
      console.log(`(re)creating chart "${chartName}"`);

      // the chart is linked to the defined URL of the local server
      if (isHttpHookChart(chart)) {
        const name =
          chartName ?? (await computeIdentifiers(ChartType.HTTP_HOOK)).chartName;
        hookGetChart(chartServer)(chart);
        charts[name] = { chart };
      }

      // channel creation for active dispatching to target URL
      if (isHttpDispatchChart(chart)) {
        const name =
          chartName ?? (await computeIdentifiers(ChartType.HTTP_DISPATCH)).chartName;
        const { chan } = await hookPostChart(chart);
        charts[name] = { chart, channel: chan };
      }

      if(isGraphqlHookChart(chart)) {
        console.log('graphql hook chart')
      }

      // channel creation for active dispatching to target URL
      if (isGraphqlDispatchChart(chart)) {
        console.log('graphql dispatch chart')
      }
    },
    purge: async () => {
      for (const [_, { chart, channel }] of Object.entries(charts)) {
        if (isHttpHookChart(chart)) {
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

      if (isHttpHookChart(chart.chart)) {
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

      if (isHttpDispatchChart(chart.chart)) {
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

      if (isHttpHookChart(chart.chart)) {
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



const validateRunCmdOptions = (chart: Chart<ChartType.HTTP_DISPATCH>, cmd: RunCmd) => {
  const mergedOpts = { ...chart.options, ...cmd.options };

  if(!mergedOpts.perSec || !mergedOpts.url) {
    throw new Error('perSec and url are mandatory in a JSON chart definition or command options');
  }
}


export const charts = {
  reload,
  fromRequest,
  fromGraphqlRequest,
  hookGetChart,
  hookPostChart,
  group,
};

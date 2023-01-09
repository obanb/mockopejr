import {testChartGroup, testUtils } from '../src/testUtils.js';
import * as post_chart from './post_chart.json';
import { Chart, ChartType, CmdType } from '../src/types.js';
import { httpUtils } from '../src/httpUtils.js';
import { routerTables } from '../src/routerTables.js';


const jestFn = jest.fn((callback) => callback);
testUtils.useServers();
jest.setTimeout(10000);

describe('http cmd/json chart/active channel integration tests', () => {
  it('should test the retry based chart/channel mechanism via http requests', async () => {
    const cfg = {
      chart: {
        name: 'testChart',
        method: 'POST'
      },
      channel: {
        perSec: 1,
        buffer: 1,
        runs: 2
      },
      test: {
        delay: 0.5
      }
    }

    const chart = post_chart as any as Chart<ChartType.POST>;

    await testChartGroup.add(chart, cfg.chart.name);

    const currentCharts = testChartGroup.list();
    const keys = Object.keys(currentCharts);
    expect(keys).toHaveLength(1);

    const activeChannel = testChartGroup.get()[cfg.chart.name].channel;

    expect(activeChannel).toBeDefined();

    const cmdHttpResponse = await httpUtils.post(
      `${testUtils.config.localhost}:${testUtils.config.app.port}/cmd`,
      {
        type: CmdType.RUN,
        options: {
          perSec: cfg.channel.perSec,
          url: null,
          buffer: cfg.channel.buffer,
        },
        identifier: cfg.chart.name
      }
    );

      jest.spyOn(routerTables.proxyRouterTable, 'post/mirror').mockImplementation((req, res, args) => {
          jestFn(req)
          res.writeHead(200);
          res.end(JSON.stringify(args));
        }
      );

     expect(cmdHttpResponse.status).toBe(200);


    await new Promise((res) =>
      setTimeout(res, cfg.channel.perSec * cfg.channel.runs * 1000 + cfg.test.delay * 1000),
    );

    expect(jestFn).toHaveBeenCalledTimes(cfg.channel.runs);
    expect(jestFn.mock.calls.length).toBe(cfg.channel.runs);
    expect(jestFn.mock.calls[0][0].method).toBe(cfg.chart.method);
  })
    it('should test the start/stop chart/channel mechanism via http requests', async () => {
      const cfg = {
        chart: {
          name: 'testChart',
          method: 'POST'
        },
        channel: {
          perSec: 4,
          buffer: 1,
          runs: 2
        },
        test: {
          delay: 0.5
        }
      }

      const chart = post_chart as any as Chart<ChartType.POST>;

      await testChartGroup.add(chart, cfg.chart.name);

      const currentCharts = testChartGroup.list();
      const keys = Object.keys(currentCharts);
      expect(keys).toHaveLength(1);

      const activeChannel = testChartGroup.get()[cfg.chart.name].channel;

      expect(activeChannel).toBeDefined();

      const cmdHttpResponse = await httpUtils.post(
        `${testUtils.config.localhost}:${testUtils.config.app.port}/cmd`,
        {
          type: CmdType.RUN,
          options: {
            perSec: cfg.channel.perSec,
            url: '--',
            buffer: cfg.channel.buffer,
          },
          identifier: cfg.chart.name
        }
      );

      jest.spyOn(routerTables.proxyRouterTable, 'post/mirror').mockImplementation((req, res, args) => {
          jestFn(req)
          res.writeHead(200);
          res.end(JSON.stringify(args));
        }
      );

      expect(cmdHttpResponse.status).toBe(200);

      await new Promise((res) =>
        setTimeout(res, cfg.channel.runs * 1000 + cfg.test.delay * 1000),
      );


      const httpPause = await httpUtils.post(
        `${testUtils.config.localhost}:${testUtils.config.app.port}/cmd`,
        {
          type: CmdType.PAUSE,
          identifier: cfg.chart.name
        }
      );

      expect(httpPause.status).toBe(200);


      await new Promise((res) =>
        setTimeout(res, cfg.channel.runs * 1000),
      );

      expect(jestFn).toHaveBeenCalledTimes(cfg.channel.runs);
      expect(jestFn.mock.calls.length).toBe(cfg.channel.runs);
      expect(jestFn.mock.calls[0][0].method).toBe(cfg.chart.method);
    })
})

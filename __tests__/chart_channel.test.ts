
import { Chart, ChartType, CmdType } from '../src/types.js';
import * as post_chart from './post_chart.json';

import {
  testChartGroup,
  testUtils,
} from '../src/testUtils.js';
import { routing } from '../src/routing.js';
import { IncomingMessage, ServerResponse } from 'http';


const jestFn = jest.fn((callback) => callback);

beforeAll(() => {
  jest.spyOn(routing, 'createRouter').mockImplementation(() => ({
    route: (req: IncomingMessage, res: ServerResponse) => {
      jestFn(req);
      res.writeHead(200);
      res.end('Not all those who wander are lost.');
    },
  }));
});

testUtils.useServers();

describe('chart/channel integration tests', () => {
  it('should test active channel and post chart', async () => {

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
    // const original = utils.structuredClone(chart)
    await testChartGroup.add(chart, cfg.chart.name);

    const currentCharts = testChartGroup.list();
    const keys = Object.keys(currentCharts);
    expect(Object.keys(keys)).toHaveLength(1);

    const activeChannel = testChartGroup.get()['testChart'].channel;


    await activeChannel.next({
      type: CmdType.RUN,
      options: {
        perSec: cfg.channel.perSec,
        url: '--',
        buffer: cfg.channel.buffer,
      },
    });

    console.log(activeChannel);

    expect(activeChannel).toBeDefined();

    await new Promise((res) =>
      setTimeout(res, cfg.channel.perSec * cfg.channel.runs * 1000 + cfg.test.delay * 1000),
    );

    expect(jestFn).toHaveBeenCalledTimes(cfg.channel.runs);
    expect(jestFn.mock.calls.length).toBe(cfg.channel.runs);
    expect(jestFn.mock.calls[0][0].method).toBe(cfg.chart.method);
  });
});

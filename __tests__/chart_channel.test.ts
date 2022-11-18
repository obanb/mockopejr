import { plugableServer } from '../src/plugableServer.js';
import { server } from '../src/server.js';
import { charts } from '../src/charts.js';
import { Chart, ChartType, CmdType } from '../src/types.js';
import * as post_chart from './post_chart.json';

import {
  chartTestServer,
  proxyTestServer,
  testChartGroup,
  testUtils,
} from '../src/testUtils.js';
import { routing } from '../src/routing.js';
import { IncomingMessage, ServerResponse } from 'http';


const jestFn = jest.fn((callback) => callback);

beforeAll(() => {
  jest.spyOn(routing, 'createRouter').mockImplementation(() => ({
    route: (_: IncomingMessage, res: ServerResponse) => {
      console.log('prase');
      jestFn(_);
      console.log(res.statusCode);
      res.writeHead(200);
      res.end('ok');
    },
  }));
});
testUtils.useServers();

describe('chart channel integration tests', () => {
  it('should test active channel and post chart', async () => {
    jest.spyOn(plugableServer, 'new').mockImplementation(() => chartTestServer);
    jest.spyOn(charts, 'group').mockImplementation(() => testChartGroup);

    jest.spyOn(server, 'runServer').mockImplementation(() => proxyTestServer);

    const chart = post_chart as any as Chart<ChartType.POST>;
    // const original = utils.structuredClone(chart)
    await testChartGroup.add(chart, 'testChart');

    const currentCharts = testChartGroup.list();
    const keys = Object.keys(currentCharts);
    expect(Object.keys(keys)).toHaveLength(1);

    const activeChannel = testChartGroup.get()['testChart'].channel;

    const perSec = 1;
    const runs = 2;
    const delay = 0.5;

    await activeChannel.next({
      type: CmdType.RUN,
      options: {
        perSec,
        url: '--',
        buffer: 1,
      },
    });

    console.log(activeChannel);

    expect(activeChannel).toBeDefined();

    await new Promise((res) =>
      setTimeout(res, perSec * 2 * 1000 + delay * 1000),
    );

    expect(jestFn).toHaveBeenCalledTimes(runs);
    expect(jestFn.mock.calls.length).toBe(runs);
    expect(jestFn.mock.calls[0][0].method).toBe('POST');
  });
});

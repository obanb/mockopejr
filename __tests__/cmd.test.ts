// import { routing } from '../src/routing.js';
// import { IncomingMessage, ServerResponse } from 'http';
import { appTestServer, chartTestServer, testChartGroup, testUtils } from '../src/testUtils.js';
import { plugableServer } from '../src/plugableServer.js';
// import { charts } from '../src/charts.js';
import { server } from '../src/server.js';
import * as post_chart from './post_chart.json';
import { Chart, ChartType, CmdType } from '../src/types.js';
import { httpUtils } from '../src/httpUtils.js';
import { charts } from '../src/charts.js';
// import { IncomingMessage, ServerResponse } from 'http';
// import { routing } from '../src/routing.js';
import { routerTables } from '../src/routerTables.js';
// import { charts } from '../src/charts.js';
// import { httpUtils } from '../src/httpUtils.js';

const jestFn = jest.fn((callback) => callback);

// beforeAll(() => {
//   jest.spyOn(routing, 'createRouter').mockImplementation(() => ({
//     route: (_: IncomingMessage, res: ServerResponse) => {
//       console.log('prase');
//       jestFn(_);
//       console.log(res.statusCode);
//       res.writeHead(200);
//       res.end('ok');
//     },
//   }));
// });
testUtils.useServers();

describe('cmd integration tests', () => {
  it('should test channel run and stop throw server cmd', async () => {
    jest.spyOn(plugableServer, 'new').mockImplementation(() => chartTestServer);
    jest.spyOn(charts, 'group').mockImplementation(() => testChartGroup);

    jest.spyOn(server, 'runServer').mockImplementation(() => appTestServer);

    const chart = post_chart as any as Chart<ChartType.POST>;
    // const original = utils.structuredClone(chart)
    await testChartGroup.add(chart, 'testChart');

    const currentCharts = testChartGroup.list();
    const keys = Object.keys(currentCharts);
    expect(Object.keys(keys)).toHaveLength(1);

    const activeChannel = testChartGroup.get()['testChart'].channel;

    expect(activeChannel).toBeDefined();

    console.log('URI', `${testUtils.config.localhost}:${testUtils.config.app.port}/info`)


    const res = await httpUtils.post(
      `${testUtils.config.localhost}:${testUtils.config.app.port}/cmd`,
      {
        type: CmdType.RUN,
        options: {
          perSec: 1,
          url: '--',
          buffer: 1,
        },
        identifier: "testChart"
      }
    );

      jest.spyOn(routerTables.proxyRouterTable, 'post/mirror').mockImplementation((_, res, args) => {
          console.log(res)
          console.log("ROUTUJU",JSON.stringify(args))
          jestFn(_)
          res.writeHead(200);
          res.end(JSON.stringify(args));
        }
      );
    //
    // console.log("APP REST", res)
    //
    expect(res.status).toBe(200);


    await new Promise((res) =>
      setTimeout(res, 1 * 2 * 1000 + 0.5 * 1000),
    );

    expect(jestFn).toHaveBeenCalledTimes(2);
    expect(jestFn.mock.calls.length).toBe(2);
    expect(jestFn.mock.calls[0][0].method).toBe('POST');
  })
})

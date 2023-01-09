import * as http from 'http';
import { plugableServer } from './plugableServer.js';
import { routerTables } from './routerTables.js';
import { RouterTable } from './types.js';
import { routing } from './routing.js';
import { charts } from './charts.js';

const config = {
  app: { port: 3030, desc: 'app test' },
  chart: { port: 3031, desc: 'chart test' },
  proxy: { port: 3032, desc: 'proxy test' },
  localhost: 'http://127.0.0.1',
};

const runServer = (port: number, routerTable: RouterTable, desc = '') => {
  const router = routing.createRouter(routerTable);
  const listener = routing.requestListener(router);
  const server = http.createServer(listener);
  server.listen(port);
  console.log(`${desc} server listening on port ${port}`);
  return server;
};

export let chartTestServer: ReturnType<typeof plugableServer.new>;
export let appTestServer: http.Server;
export let proxyTestServer: http.Server;
export let testChartGroup: ReturnType<typeof charts.group>;

const useServers = () => {
  beforeAll(() => {
    chartTestServer = plugableServer.new(
      { port: config.chart.port, desc: config.chart.desc },
      routerTables.chartRouterTable,
    );
    chartTestServer.run();


    testChartGroup = charts.group(chartTestServer)

    proxyTestServer = runServer(
      config.proxy.port,
      routerTables.proxyRouterTable,
      config.proxy.desc,
    );
    console.log(
      `${config.proxy.desc} server running on port ${config.proxy.port}`,
    );

    appTestServer = runServer(
      config.app.port,
      routerTables.appRouterTable(testChartGroup),
      config.app.desc,
    );
    console.log(`${config.app.desc} server running on port ${config.app.port}`);

    console.log(
      `${config.chart.desc} server running on port ${config.chart.port}`,
    );
  }),
    afterAll(async () => {
      chartTestServer.close();
      appTestServer.close();
      proxyTestServer.close();

      chartTestServer = null;
      appTestServer = null;
      proxyTestServer = null;

      testChartGroup = null;

      console.log(`test servers closed`);
    }),
  afterEach(async() => {
    jest.clearAllMocks();
    await testChartGroup.purge()
  });
};

export const testUtils = {
  config,
  useServers,
};

import { server } from './server.js';
import { routerTables } from './routerTables.js';
import { plugableServer } from './plugableServer.js';
import { charts } from './charts.js';

const chartServer = plugableServer.new({ port: 8092, desc: 'chart' }, {});

const chartGroup = charts.group(chartServer);

export function main() {
  console.log('Logr started..');

  server.runServer(8090, routerTables.appRouterTable(chartGroup), 'app');

  server.runServer(8091, routerTables.proxyRouterTable, 'proxy');

  chartServer.run();
}

import { server } from './server.js';
import { routerTables } from './routerTables.js';
import { plugableServer } from './plugableServer.js';
import { charts } from './core/charts.js';
import express from 'express';

const { PROXY_PORT, APP_PORT = 3333, CHART_PORT } = process.env;

const chartServer = plugableServer.new(
  { port: Number(CHART_PORT), desc: 'chart' },
  {},
);

const chartGroup = charts.group(chartServer);

export const main = async () => {
  console.log('Logr started..');


  const srvr = express();

  const routes: Record<string, unknown> = srvr.routes

  srvr.use(express.json({limit: '50mb'}));


  await charts.reload(chartGroup)();

  server.runServer(
    Number(APP_PORT),
    routerTables.appRouterTable(chartGroup),
    'app',
  );

  server.runServer(Number(PROXY_PORT), routerTables.proxyRouterTable, 'proxy');

  chartServer.run();
};

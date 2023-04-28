
import express from 'express';

const {APP_PORT = 3333} = process.env;


export const main = async () => {
  console.log('Logr started..');


  const srvr = express();

  srvr.use(express.json({limit: '50mb'}));


  // await charts.reload(chartGroup)();
  //
  // server.runServer(
  //   Number(APP_PORT),
  //   routerTables.appRouterTable(chartGroup),
  //   'app',
  // );
  //
  // server.runServer(Number(PROXY_PORT), routerTables.proxyRouterTable, 'proxy');
  //
  // chartServer.run();


  srvr.listen(APP_PORT)
};

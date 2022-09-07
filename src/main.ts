import * as http from 'http';
import { routing } from './routing.js';
import { RouterTable } from './types.js';


export function main() {
  console.log('Logr started..')

  runServer(8090, routing.appRouterTable, 'app')

  runServer(8091, routing.proxyRouterTable, 'proxy')

  runServer(8092, routing.chartRouterTable, 'chart')
}

export const runServer = (port: number, routerTable: RouterTable, desc = "") => {
  const router = routing.createRouter(routerTable);
  const listener = routing.requestListener(router);
  const server = http.createServer(listener);
  server.listen(port)
  console.log(`${desc} server listening on port" ${port}`);
}

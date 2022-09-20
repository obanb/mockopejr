import * as http from 'http';
import { routing } from './routing.js';
import { RouterTable } from './types.js';
import { plugableServer } from './plugableServer.js';
import { channel } from './channel.js';


export const chartServer = plugableServer.new({port: 8092, desc: 'chart'}, routing.chartRouterTable)

export const channelGroup = channel.group()

export function main() {
  console.log('Logr started..')

  runServer(8090, routing.appRouterTable, 'app')

  runServer(8091, routing.proxyRouterTable, 'proxy')

  chartServer.run()

}

export const runServer = (port: number, routerTable: RouterTable, desc = "") => {
  const router = routing.createRouter(routerTable);
  const listener = routing.requestListener(router);
  const server = http.createServer(listener);
  server.listen(port)
  console.log(`${desc} server listening on port" ${port}`);
  return server
}



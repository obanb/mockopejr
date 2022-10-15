
import { server } from './server.js';
import { routerTables } from './routerTables.js';
import { plugableServer } from './plugableServer.js';
import { channel } from './channel.js';


export const chartServer = plugableServer.new({port: 8092, desc: 'chart'}, {})

export const channelGroup = channel.group()

export function main() {
  console.log('Logr started..')

  server.runServer(8090, routerTables.appRouterTable(chartServer, channelGroup), 'app')

  server.runServer(8091, routerTables.proxyRouterTable, 'proxy')

  chartServer.run()

}




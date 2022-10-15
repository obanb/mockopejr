import { plugableServer } from './plugableServer.js';
import { channel } from './channel.js';
import { routerTables } from './routerTables.js';

const chartServer = plugableServer.new({port: 8092, desc: 'chart'}, routerTables.chartRouterTable)

const channelGroup = channel.group()

export const state = {
  chartServer,
  channelGroup
}

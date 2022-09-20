import { runServer } from './main.js';
import { routing } from './routing.js';
import { plugableServer } from './plugableServer.js';
import * as http from 'http';

const config = {
  app: {port: 8091, desc: 'app test'},
  chart: {port: 8092, desc:'chart test'},
  proxy: {port: 8093, desc: 'proxy test'},
  localhost: 'http://127.0.0.1'
}

export let chartTestServer: ReturnType<typeof plugableServer.new>
export let appTestServer: http.Server
export let proxyTestServer: http.Server

const useServers = () => {
  beforeAll(() => {
    appTestServer = runServer(config.app.port, routing.appRouterTable, config.app.desc)
    console.log(`${config.app.desc} server running on port ${config.app.port}`)

    appTestServer = runServer(config.proxy.port, routing.proxyRouterTable, config.proxy.desc)
    console.log(`${config.proxy.desc} server running on port ${config.app.port}`)

    chartTestServer = plugableServer.new({port: config.chart.port, desc: config.chart.desc}, routing.chartRouterTable)
    chartTestServer.run()

    console.log(`${config.chart.desc} server running on port ${config.chart.port}`)

  }),
  afterAll(async() => {
    chartTestServer.close()
    appTestServer.close()

    chartTestServer = null
    appTestServer = null

    console.log(`test servers closed`)
  })
}

export const testUtils = {
  config,
  useServers,
}

import { httpUtils } from '../src/httpUtils.js';
import { chartTestServer, testUtils } from '../src/testUtils.js';

testUtils.useServers()

describe('plugable server tests', () => {
  it('should test plug method', async() => {

    // plugable chart server for online http handlers management
    const chartServer = chartTestServer

    chartServer.plug('GET','hello', (_, res) => {
      res.writeHead(200);
      res.end(JSON.stringify({"hello":"hello"}))
    })

    const res = await httpUtils.get(`${testUtils.config.localhost}:${testUtils.config.chart.port}/hello`)

    expect(
       res.status
    ).toBe(200);
    expect(
      res.data
    ).toEqual({"hello": "hello"});
  }),
    it('should test unplug method', async() => {

      // plugable chart server for online http handlers management
      const chartServer = chartTestServer


      chartServer.plug('GET','hello', (_, res) => {
        res.writeHead(200);
        res.end(JSON.stringify({"hello":"hello"}))
      })

      const res = await httpUtils.get(`${testUtils.config.localhost}:${testUtils.config.chart.port}/hello`)

      expect(
        res.status
      ).toBe(200);
      expect(
        res.data
      ).toEqual({"hello": "hello"});

      chartServer.unplug('get/hello')

      const failure = await httpUtils.get(`${testUtils.config.localhost}:${testUtils.config.chart.port}/hello}`).catch(e => ({status: e.response.status}))

      expect(
        failure.status
      ).toBe(404);

    })

})

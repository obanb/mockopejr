import { runServer } from '../src/main.js';
import { routing } from '../src/routing.js';
import { plugableServer } from '../src/plugableServer.js';
import { httpUtils } from '../src/httpUtils.js';

describe('plugable server tests', () => {
  it('should test plug method', async() => {

    // common app server for receiving commands
    runServer(8090, routing.appRouterTable, 'app')

    // plugable chart server for online http handlers management
    const chartServer = plugableServer.new({port: 8092, desc: 'chart'}, routing.chartRouterTable)

    chartServer.run()

    chartServer.plug('GET','hello', (_, res) => {
      res.writeHead(200);
      res.end(JSON.stringify({"hello":"hello"}))
    })

    const res = await httpUtils.get('http://127.0.0.1:8092/hello')

    expect(
       res.status
    ).toBe(200);
    expect(
      res.data
    ).toEqual({"hello": "hello"});
  }),
    it('should test unplug method', async() => {

      // common app server for receiving commands
      runServer(8090, routing.appRouterTable, 'app')

      // plugable chart server for online http handlers management
      const chartServer = plugableServer.new({port: 8092, desc: 'chart'}, routing.chartRouterTable)

      chartServer.run()

      chartServer.plug('GET','hello', (_, res) => {
        res.writeHead(200);
        res.end(JSON.stringify({"hello":"hello"}))
      })

      const res = await httpUtils.get('http://127.0.0.1:8092/hello')

      expect(
        res.status
      ).toBe(200);
      expect(
        res.data
      ).toEqual({"hello": "hello"});

      chartServer.unplug('get/hello')

      const failure = await httpUtils.get('http://127.0.0.1:8092/hello')

      expect(
        failure.status
      ).toBe(404);

    })

})

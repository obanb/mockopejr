import { routing } from '../src/routing.js';
import { runServer } from '../src/main.js';
import { httpUtils } from '../src/httpUtils.js';
import * as getChart from './get_chart.json';
import { charts } from '../src/charts.js';

describe('http & routing tests', () => {
  it('should test url path get from url string', () => {
    expect(routing.getUrlPath('http://localhost:8080/path1/path2')).toBe(
      '/path1/path2',
    );
    expect(routing.getUrlPath('http://localhost:8080/')).toBe('/');
    expect(routing.getUrlPath('http://localhost:8080')).toBe('/');
    expect(routing.getUrlPath('http://localhost:8080/path1?arg1=2')).toBe(
      '/path1',
    );
  }),
    it('should test url query params get from url path string', () => {
      expect(
        routing.getQueryParams('http://localhost:8080/path1?arg1=2')[0],
      ).toBe('arg1=2');
      expect(
        routing.getQueryParams('http://localhost:8080/path1?arg1=2?arg2=3')[0],
      ).toBe('arg1=2');
      expect(
        routing.getQueryParams('http://localhost:8080/path1?arg1=2?arg2=3')[1],
      ).toBe('arg2=3');
    }),
    it('should test url query params convert to key/value pair map', () => {
      const queries = [['arg1=2'], ['arg1=2', 'arg2=3']];
      expect(routing.getQueryParamsPairs(queries[0])).toEqual({ arg1: '2' });
      expect(routing.getQueryParamsPairs(queries[1])).toEqual({
        arg1: '2',
        arg2: '3',
      });
    });
  it('bla bla', async() => {
    const table = {} as any
    runServer(8090, routing.appRouterTable, 'app')


    table["post/hello"] = (_, res) => {
      res.writeHead(200);

      res.end(JSON.stringify({"hello":"hello"}))
    }



    runServer(8093, table, 'chart')


    table["get/pes"] = (_, res) => {
      res.writeHead(200);

      res.end(JSON.stringify({"hello":"hello"}))
    }

    const chart = getChart

    console.log(chart)

    // jest.spyOn(json, 'readCharts').mockImplementation(async() => [chart])

    await charts.addGetChart(routing.chartRouterTable)(chart as any)


    const fes = routing.chartRouterTable
    console.log(fes)

    const res = await httpUtils.get('http://127.0.0.1:8093/pes')
    const res2 = await httpUtils.post('http://127.0.0.1:8093/hello',{})


    // udelat literal na urls
    console.log('vysledek', res.data)
    console.log('vysledek', res2.data)
  })
});

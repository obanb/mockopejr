import { chartTestServer, testUtils } from '../src/testUtils.js';
import * as get_chart from './get_chart.json';
import * as post_chart from './post_chart.json';
import { charts } from '../src/charts.js';
import { httpUtils } from '../src/httpUtils.js';
import { Chart, ChartType } from '../src/types.js';
import { plugableServer } from '../src/plugableServer.js';
import { utils } from '../src/utils.js';
import { channelGroup } from '../src/main.js';

testUtils.useServers()

describe('chart tests', () => {
  it('should test addGetChart fn', async () => {

    jest.spyOn(plugableServer, 'new').mockImplementation(() => chartTestServer)
      const chart = get_chart as any as Chart<ChartType.GET>
      const original = utils.structuredClone(chart)
     charts.addGetChart(chart)

     const res = await httpUtils.get(`${testUtils.config.localhost}:${testUtils.config.chart.port}/hello`)
     expect(res.status).toBe(200)
     expect(Object.keys(res.data).sort()).toEqual(Object.keys(original.schema).sort())
  }),
  it('should test addPostChart fn', async () => {

    jest.spyOn(plugableServer, 'new').mockImplementation(() => chartTestServer)
    const chart = post_chart as any as Chart<ChartType.POST>
    // const original = utils.structuredClone(chart)
    await charts.addPostChart(chart)

    const currentChannels = channelGroup.list()

    expect(Object.keys(currentChannels)).toHaveLength(1)
  })
  it('should test addPostChart fn and run single channel', async () => {

    jest.spyOn(plugableServer, 'new').mockImplementation(() => chartTestServer)
    const chart = post_chart as any as Chart<ChartType.POST>
    // const original = utils.structuredClone(chart)
    await charts.addPostChart(chart)

    const currentChannels = channelGroup.list()
    const keys = Object.keys(currentChannels)
    expect(Object.keys(keys)).toHaveLength(1)

    const activeChannel = currentChannels[keys[0]]

    expect(activeChannel).toBeDefined()
  })
})

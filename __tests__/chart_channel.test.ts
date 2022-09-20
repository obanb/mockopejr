import { plugableServer } from '../src/plugableServer.js';
import { chartTestServer, testUtils } from '../src/testUtils.js';
import { Chart, ChartType } from '../src/types.js';
import { charts } from '../src/charts.js';
import * as post_chart from './post_chart.json';
import { channelGroup } from '../src/main.js';

testUtils.useServers()


describe('chart channel integration tests', () => {
  it('should test active channel and post chart', async () => {

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

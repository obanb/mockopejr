import {
  chartTestServer,
  testChartGroup,
  testUtils,
} from '../src/testUtils.js';
import * as get_chart from './get_chart.json';
import * as post_chart from './post_chart.json';
import { httpUtils } from '../src/httpUtils.js';
import { Chart, ChartType } from '../src/types.js';
import { plugableServer } from '../src/plugableServer.js';
import { utils } from '../src/utils.js';

testUtils.useServers();

describe('chart/group/http integration tests', () => {
  it('should test chartGroup get hook and http response', async () => {
    jest.spyOn(plugableServer, 'new').mockImplementation(() => chartTestServer);
    const chart = get_chart as unknown as Chart<ChartType.GET>;

    // deep copy due to subsequent mutation of the object by json generators
    const original = utils.structuredClone(chart);

    await testChartGroup.add(chart);

    const res = await httpUtils.get(
      `${testUtils.config.localhost}:${testUtils.config.chart.port}/hello`,
    );
    expect(res.status).toBe(200);
    expect(Object.keys(res.data).sort()).toEqual(
      Object.keys(original.schema).sort(),
    );
  });
  it('should test chartGroup post hook', async () => {
    jest.spyOn(plugableServer, 'new').mockImplementation(() => chartTestServer);
    const chart = post_chart as unknown as Chart<ChartType.POST>;

    await testChartGroup.add(chart);

    const currentChannels = testChartGroup.list();

    expect(Object.keys(currentChannels)).toHaveLength(1);
  });
  it('should test chartGroup post hook and channel creation', async () => {
    jest.spyOn(plugableServer, 'new').mockImplementation(() => chartTestServer);
    const chart = post_chart as unknown as Chart<ChartType.POST>;

    await testChartGroup.add(chart);

    const currentChannels = testChartGroup.list();
    const keys = Object.keys(currentChannels);

    expect(keys).toHaveLength(1);

    const activeChannel = currentChannels[keys[0]];

    expect(activeChannel).toBeDefined();
  });
});

import { ChartCfg, isGraphQLChart, isHttpChart, JsonChart } from './types';

const serve = (cfg: ChartCfg, jsonChart: JsonChart) => {
  if(isHttpChart(jsonChart)) {
    return 'http'
  }

  if(isGraphQLChart(jsonChart)) {
    return 'graphql'
  }
}

export const chart = {
  serve
}

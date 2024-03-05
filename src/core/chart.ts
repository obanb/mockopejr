import { ChartCfg, isGraphQLChart, isHttpChart, JsonChart } from './types.js';

const serve = (cfg: ChartCfg, jsonChart: JsonChart) => {
  if(isHttpChart(jsonChart)) {
    return 'http'
  }

  if(isGraphQLChart(jsonChart)) {
    return 'graphql'
  }

  return 'unknown'
}

export const chart = {
  serve
}

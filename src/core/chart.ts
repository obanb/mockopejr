import { ChartCfg, isGraphQLChart, isHttpChart, JsonChart, JsonGraphQLChart, JsonHttpChart } from './types.js';
import { reflection } from '../parsing/reflection';

const serve = async(jsonChart: JsonChart) => {
  if(isHttpChart(jsonChart)) {
    return 'http'
  }

  if(isGraphQLChart(jsonChart)) {
    return 'graphql'
  }

  return 'unknown'
}

const serverHttpChart = async(chart: JsonHttpChart) => {
  const arrayify = chart.config.arrayify;
  if (arrayify > 1) {
    return Array.from({ length: arrayify }, () =>
      reflection.reflectAndGenerate(chart.schema),
    );
  }
  return reflection.reflectAndGenerate(chart.schema);
}

const serverGraphQLChart = async(chart: JsonGraphQLChart) => {

}

export const chart = {
  serve,
  serverHttpChart,
  serverGraphQLChart
}

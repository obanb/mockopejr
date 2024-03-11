import { isGraphQLChart, isHttpChart, JsonChart, JsonGraphQLChart, JsonHttpChart } from './types.js';
import { reflection } from '../parsing/reflection';

const serve = async(jsonChart: JsonChart) => {
  if(isHttpChart(jsonChart)) {
    return serverHttpChart(jsonChart)
  }

  if(isGraphQLChart(jsonChart)) {
    return serverGraphQLChart(jsonChart)
  }

  return 'unknown'
}

const serverHttpChart = (chart: JsonHttpChart) => {
  const arrayify = chart.config.arrayify;
  if (arrayify > 1) {
    return Array.from({ length: arrayify }, () =>
      reflection.reflectAndGenerate(chart.schema),
    );
  }
  return reflection.reflectAndGenerate(chart.schema);
}

const serverGraphQLChart = async(chart: JsonGraphQLChart) => {
  const arrayify = chart.config.arrayify;
  if (arrayify > 1) {
    return Array.from({ length: arrayify }, () =>
      reflection.reflectAndGenerate(chart.schema),
    );
  }
  return reflection.reflectAndGenerate(chart.schema);
}

export const chart = {
  serve,
  serverHttpChart,
  serverGraphQLChart
}

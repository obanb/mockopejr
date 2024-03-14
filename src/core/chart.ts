import { JsonGraphQLChart, JsonHttpChart } from './types.js';
import { reflection } from '../parsing/reflection.js';


const resolveGraphqlChart = (keys: string[], charts: JsonGraphQLChart[]) => {
    const chartsKeys = charts.map((chart) => chart.keys);
    const accurateIndex = getMostAccurateArrayMatch(chartsKeys, keys);
    if(accurateIndex === null){
      return null
    }
    const chart = charts[accurateIndex];
    return serverGraphQLChart(chart);
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

const getMostAccurateArrayMatch = (arrs:string[][], input: string[]): null | number => {
  let matchMax = 0
  let mostSimilar
  let mostSimilarIndex
  arrs.forEach((arr, index) => {
    let localmax = 0
    arr.forEach((item, inner_index) => {
      if(item === input[inner_index]){
        localmax++
        if(localmax > matchMax){
          matchMax = localmax
          mostSimilar = arr
          mostSimilarIndex = index
        }
        if(localmax === matchMax){
          if(arr.length < mostSimilar.length){
            mostSimilar = arr
            mostSimilarIndex = index
          }
        }
      }
    })
  })
  if(matchMax === 0){
    return null
  }
  return mostSimilarIndex
}

export const chart = {
  resolveGraphqlChart,
  serverHttpChart,
  serverGraphQLChart
}

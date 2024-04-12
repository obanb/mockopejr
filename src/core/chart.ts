import { JsonGraphQLChart, JsonHttpChart } from './types.js';
import { reflection } from '../parsing/reflection.js';

const resolveGraphqlChart = (expressionParseFn: (input: string) => Promise<unknown>, keys: string[], charts: JsonGraphQLChart[]) => {
    const chartsKeys = charts.map((chart) => chart.keys);
    const similarArrMatch = getMostSimilarArrayMatch(chartsKeys, keys);
    if(similarArrMatch.index === -1){
      return null
    }
    // deep clone to avoid array mutation on original structure at next steps
    const chart = structuredClone(charts[similarArrMatch.index]);
    return serverGraphQLChart(expressionParseFn, chart);
}

const serverHttpChart = async(expressionParseFn: (input: string) => Promise<unknown>,chart: JsonHttpChart) => {
  const arrayify = chart.config.arrayify;
  if (arrayify > 1) {
    const promises = Array.from({ length: arrayify }, () =>
       reflection.reflectAndGenerate(expressionParseFn, chart.schema, chart.config.mimicMode),
    );
    const results = await Promise.all(promises);
    return results
  }
  return await reflection.reflectAndGenerate(expressionParseFn, chart.schema, chart.config.mimicMode);
}

const serverGraphQLChart = async(expressionParseFn: (input: string) => Promise<unknown>, chart: JsonGraphQLChart) => {
  const arrayify = chart.config.arrayify;
  if (arrayify > 1) {
    return Array.from({ length: arrayify }, async() =>
      await reflection.reflectAndGenerate(expressionParseFn, chart.schema, chart.config.mimicMode),
    );
  }
  return await reflection.reflectAndGenerate(expressionParseFn, chart.schema, chart.config.mimicMode);
}

// gets most similar array match based
// example:
// const arrs = [['a', 'b', 'c'], ['a', 'b', 'd'], ['a', 'b', 'c', 'd']]
// const input = ['a', 'b', 'c']
// getMostSimilarArrayMatch(arrs, input) => {index: 0, arr: ['a', 'b', 'c']}
// if same match count, returns the one with less elements
const getMostSimilarArrayMatch = (arrs:string[][], input: string[]): {index: number, arr: string[]} => {
  let matchMax = 0
  let mostSimilar
  let mostSimilarIdx = -1
  const deepClone: string[][] =  structuredClone(arrs);

  deepClone.forEach((keys, index) => {
    let localMax = 0
    input.forEach(inputItem => {
      const firstIndexOf = keys.indexOf(inputItem)
      if(firstIndexOf !== -1){
        localMax++
        keys.splice(firstIndexOf, 1)
      }
    })
    if(localMax > matchMax){
      mostSimilarIdx = index
      mostSimilar = arrs[index]
      matchMax = localMax
    }
    if(localMax === matchMax){
      if(arrs[index].length < mostSimilar.length){
        mostSimilar = arrs[index]
        mostSimilarIdx = index
      }
    }

  })
  return {index:mostSimilarIdx, arr: arrs[mostSimilarIdx]}
}

export const chart = {
  resolveGraphqlChart,
  serverHttpChart,
  serverGraphQLChart
}

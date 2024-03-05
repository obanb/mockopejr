import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { ChartType, JsonChart, JsonGraphQLChart, JsonHttpChart } from './types.js';


/**
 * Path to the directory where the JSON files/schemas are stored
 */
const schemaPath = './__CHARTS__/';

/**
 * Writes JSON file into schemaPath
 * @param fileName - unique filename
 * @param content - JsonChart
 * @returns Promise<void>
 */
const write = async (fileName: string, content: JsonChart) => {
  await writeFile(
    schemaPath + `${fileName}.json`,
    JSON.stringify(content, null, 2),
  ).catch(console.log);
};

/**
 * Reads all files from schemaPath
 * @returns Promise<Record<string,JsonChart>>[]> - all files from schemaPath with name as key
 */
const read = async () => {
  const charts: Record<string, JsonChart> = {};
  const files = await readdir(schemaPath);
  for (const f of files) {
    const chartName = path.parse(f).name;
    const buffer = await readFile(path.join(schemaPath, f));
    const json = JSON.parse(buffer.toString());
    charts[chartName] = json;
  }
  return charts;
};

/**
 * Gets the count of all files from schemaPath
 * @returns Promise<number>
 */
const count = async () => {
  const files = await readdir(schemaPath);
  return files.length;
};

/**
 * Get the next unique filename based on the current date and next file count in schemaPath
 * @param type - ChartType
 * @returns Promise<string>
 */
const getFileName = async(type: ChartType = 'http') => {
  const date = new Date();
  const next = await count();

  const fileName = `${next}_${type}_${date.getFullYear()}${
    date.getMonth() + 1
  }${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

  return fileName;
}

/**
 * Creates a new JSON file with a template based on the ChartType
 * @param type - ChartType
 * @returns Promise<void>
 */
const template = async (type: ChartType = 'http') => {
  console.log("TEMPLATE")
  let template;
  const fileName = await getFileName(type);
  if(type === 'graphql'){
    template = graphqlTemplate()
  } else {
    template = httpTemplate()
  }
  await write(fileName, template);
}


/**
 * Template for HTTP Chart
 * @returns JsonHttpChart
 */
const httpTemplate =  (): JsonHttpChart => {
  return {
    type: 'http',
    schema: {},
    url: '',
    config:{
      arrayify: 0,
      mimicMode: 'exact',
    },
    method: 'GET',
  }
}


/**
 * Template for GraphQL Chart
 * @returns JsonGraphQLChart
 */
const graphqlTemplate = (): JsonGraphQLChart => {
  return {
    type: 'graphql',
    schema: {},
    keys: [],
    config:{
      arrayify: 0,
      mimicMode: 'exact',
    }
  }
}

export const json = {
  write,
  read,
  count,
  template
};

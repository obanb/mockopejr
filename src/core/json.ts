import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import {
  ChartType,
  JsonChart,
  JsonGraphQLChart,
  JsonHttpChart,
} from './types.js';

const schemaPath = './__CHARTS__/';

const write = async (fileName: string, content: JsonChart) => {
  await writeFile(
    schemaPath + `${fileName}.json`,
    JSON.stringify(content, null, 2),
  ).catch(console.log);
};

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

const count = async () => {
  const files = await readdir(schemaPath);
  return files.length;
};

const getFileName = async (type: ChartType = 'http') => {
  const date = new Date();
  const next = await count();

  const fileName = `${next}_${type}_${date.getFullYear()}${
    date.getMonth() + 1
  }${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

  return fileName;
};

const template = async (type: ChartType = 'http') => {
  console.log('TEMPLATE');
  let template;
  const fileName = await getFileName(type);
  if (type === 'graphql') {
    template = graphqlTemplate();
  } else {
    template = httpTemplate();
  }
  await write(fileName, template);
};

const httpTemplate = (): JsonHttpChart => {
  return {
    type: 'http',
    schema: {
      template: true,
    },
    url: 'temporary/url/from/template',
    config: {
      arrayify: 0,
      mimicMode: 'exact',
    },
    method: 'GET',
  };
};

const graphqlTemplate = (): JsonGraphQLChart => {
  return {
    type: 'graphql',
    schema: {
      template: true,
    },
    keys: ['temporary', 'keys', 'from', 'template'],
    config: {
      arrayify: 0,
      mimicMode: 'exact',
    },
  };
};

export const json = {
  write,
  read,
  count,
  template,
};

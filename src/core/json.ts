import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Chart } from './types.js';

const schemaPath = './charts/';

const writeChart = async (fileName: string, schema: unknown) => {
  await writeFile(
    schemaPath + `${fileName}.json`,
    JSON.stringify(schema, null, 2),
  ).catch(console.log);
};

const readCharts = async () => {
  const charts: Record<string, Chart> = {};
  const files = await readdir(schemaPath);
  for (const f of files) {
    const chartName = path.parse(f).name;
    const buffer = await readFile(path.join(schemaPath, f));
    const json = JSON.parse(buffer.toString());
    charts[chartName] = json;
  }

  return charts;
};

const getCount = async () => {
  const files = await readdir(schemaPath);
  return files.length;
};

export const json = {
  writeChart,
  readCharts,
  getCount,
};

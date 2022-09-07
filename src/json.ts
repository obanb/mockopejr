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
  const charts: Chart[] = [];
  const files = await readdir(schemaPath);
  for (const f of files) {
    const buffer = await readFile(path.join(schemaPath, f));
    const json = JSON.parse(buffer.toString());
    charts.push(json);
  }

  return charts;
};

export const json = {
  writeChart,
  readCharts,
};

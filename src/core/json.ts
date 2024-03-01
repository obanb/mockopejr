import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { JsonChart } from './types';


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

export const json = {
  write,
  read,
  count,
};

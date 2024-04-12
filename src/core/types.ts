export type ChartType = 'http' | 'graphql';
export type JsonPrimitive = string | number | boolean | null;
export type JsonSchema = Record<string, JsonPrimitive>;
export type MimicMode = 'randomize' | 'exact';
export type ChartCfg = {
  arrayify: number;
  mimicMode: MimicMode;
};
export type JsonChart = JsonHttpChart | JsonGraphQLChart;
export type JsonHttpChart = {
  type: ChartType;
  schema: JsonSchema;
  url: string;
  // http method, runtime will check if it is a valid HTTP server method
  method: string;
  config: ChartCfg;
};
export type JsonGraphQLChart = {
  type: 'graphql';
  schema: JsonSchema;
  keys: string[];
  config: ChartCfg;
};
export type RequestCfg = {
  delayMs?: number;
  errorCode?: number;
};

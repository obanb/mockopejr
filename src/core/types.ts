import { IncomingHttpHeaders } from 'http';
import { RunCmdOptions } from '../api/types.js';

export enum ChartType {
  HTTP_DISPATCH = 'HTTP_DISPATCH',
  HTTP_HOOK = 'HTTP_HOOK',
  GRAPHQL_DISPATCH = 'GRAPHQL_DISPATCH',
  GRAPHQL_HOOK = 'GRAPHQL_HOOK',
  UNKNOWN = 'UNKNOWN',
}

export type GRAPHQL_REQUEST = ChartType.GRAPHQL_HOOK | ChartType.GRAPHQL_DISPATCH;
export type HTTP_REQUEST = ChartType.HTTP_HOOK | ChartType.HTTP_DISPATCH;

export type Chart<ChartType = unknown> = {
  originalQuery?: ChartType extends GRAPHQL_REQUEST ? string : never;
  schema: Record<string, unknown>;
  headers: IncomingHttpHeaders;
  type: ChartType;
  options?: ChartType extends ChartType.HTTP_DISPATCH
    ? {
      perSec: number;
      buffer: number;
      url: string;
    } :  ChartType extends ChartType.GRAPHQL_DISPATCH ? {
        perSec: number;
        url: string;
      }
    : ChartType extends ChartType.HTTP_HOOK
      ? {
        url: string;
        buffer: number;
      }
      : ChartType extends ChartType.GRAPHQL_HOOK
        ? {
          buffer: number;
        }
        : never;
};


export type ChannelOptions = {
  callbackFn: (opts?: RunCmdOptions) => Promise<unknown>;
};

export const isHttpHookChart = (chart: Chart): chart is Chart<ChartType.HTTP_HOOK> =>
  chart.type === ChartType.HTTP_HOOK;

export const isHttpDispatchChart = (chart: Chart): chart is Chart<ChartType.HTTP_DISPATCH> =>
  chart.type === ChartType.HTTP_DISPATCH;

export const isGraphqlHookChart = (chart: Chart): chart is Chart<ChartType.GRAPHQL_HOOK> =>
  chart.type === ChartType.GRAPHQL_HOOK;

export const isGraphqlDispatchChart = (chart: Chart): chart is Chart<ChartType.GRAPHQL_DISPATCH> =>
  chart.type === ChartType.GRAPHQL_DISPATCH;


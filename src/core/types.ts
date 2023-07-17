import { IncomingHttpHeaders } from 'http';
import { RunCmdOptions } from '../api/types.js';

export enum ChartType {
  GET = 'GET',
  POST = 'POST',
  UNKNOWN = 'UNKNOWN',
}

export type Chart<ChartType = unknown> = {
  schema: Record<string, unknown>;
  headers: IncomingHttpHeaders;
  type: ChartType;
  options?: ChartType extends ChartType.POST
    ? {
      perSec: number;
      buffer: number;
      url: string;
      args?: unknown[];
    }
    : ChartType extends ChartType.GET
      ? {
        url: string;
        buffer: number;
        args?: unknown[];
      }
      : null;
};


export type ChannelOptions = {
  callbackFn: (opts?: RunCmdOptions) => Promise<unknown>;
};

export const isGetChart = (chart: Chart): chart is Chart<ChartType.GET> =>
  chart.type === ChartType.GET;
export const isPostChart = (chart: Chart): chart is Chart<ChartType.POST> =>
  chart.type === ChartType.POST;

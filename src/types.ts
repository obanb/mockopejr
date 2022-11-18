import { IncomingHttpHeaders } from 'http';
import http from 'http';

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

export const isGetChart = (chart: Chart): chart is Chart<ChartType.GET> =>
  chart.type === ChartType.GET;
export const isPostChart = (chart: Chart): chart is Chart<ChartType.POST> =>
  chart.type === ChartType.POST;

export enum CmdType {
  RUN = 'RUN',
  PAUSE = 'PAUSE',
  KILL = 'KILL',
}

export type RunCmdOptions = {
  perSec: number;
  buffer: number;
  url: string;
  args?: unknown[];
};

export type Cmd = RunCmd | PauseCmd | KillCmd;

export type RunCmd = {
  type: CmdType.RUN;
  options?: RunCmdOptions;
};

export type PauseCmd = {
  type: CmdType.PAUSE;
};

export type KillCmd = {
  type: CmdType.KILL;
};

export const isCmd = (obj: any): obj is Cmd =>
  obj.type && Object.values(CmdType).includes(obj.type);
export const isRunCmd = (cmd: Cmd): cmd is RunCmd => cmd.type === CmdType.RUN;
export const isPauseCmd = (cmd: Cmd): cmd is PauseCmd =>
  cmd.type === CmdType.PAUSE;
export const isKillCmd = (cmd: Cmd): cmd is KillCmd =>
  cmd.type === CmdType.KILL;

export type RouterTable = Record<
  string,
  (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    args: Record<string, unknown>,
  ) => unknown
>;

export type ChannelOptions = {
  callbackFn: () => Promise<unknown>;
};

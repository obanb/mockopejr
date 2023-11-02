import http from 'http';

export enum CmdType {
  RUN = 'RUN',
  PAUSE = 'PAUSE',
  KILL = 'KILL',
}
export type RunCmdOptions = {
  perSec: number;
  buffer: number;
  url: string;
};

export type Cmd = RunCmd | PauseCmd | KillCmd;

export type RunCmd = {
  type: CmdType.RUN;
  identifier: string;
  options?: RunCmdOptions;
};

export type PauseCmd = {
  type: CmdType.PAUSE;
  identifier: string;
};

export type KillCmd = {
  type: CmdType.KILL;
  identifier: string;
};


export type RouterTable =
    {
      'post/graphql': (res: http.ServerResponse, keys: string[], params?: Record<string, unknown>) => Promise<unknown>,
      http:  Record<string,(req: http.IncomingMessage, res: http.ServerResponse, body: Record<string, unknown>, params?: Record<string, unknown>) => Promise<unknown>>
    }



export const isCmd = (obj: any): obj is Cmd =>
  obj.type && Object.values(CmdType).includes(obj.type);
export const isRunCmd = (cmd: Cmd): cmd is RunCmd => cmd.type === CmdType.RUN;
export const isPauseCmd = (cmd: Cmd): cmd is PauseCmd =>
  cmd.type === CmdType.PAUSE;
export const isKillCmd = (cmd: Cmd): cmd is KillCmd =>
  cmd.type === CmdType.KILL;

import { Chart } from './types.js';
import { Cmd, CmdType } from '../api/types.js';

export const validateChartOpts = (chart: Chart, cmd: Cmd) => {
  switch(cmd.type){
    case CmdType.RUN:
      validateRunCmd(input)
      break;
    case CmdType.PAUSE:
      validatePauseCmd(input)
      break;
    case CmdType.KILL:
      validateKillCmd(input)
      break;
    default:
      throw new Error('type must be a valid CmdType')
  }
}

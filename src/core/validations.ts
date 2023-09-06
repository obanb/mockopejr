import { Chart, ChartType } from './types.js';
import { RunCmd } from '../api/types.js';

export const validateAndMergeCmdOptions = (chart: Chart<ChartType.POST>, cmd: RunCmd) => {
  const mergedOpts = { ...chart.options, ...cmd.options };

  if(!mergedOpts.perSec || !mergedOpts.url) {
    throw new Error('perSec and url are mandatory in a JSON chart definition or command options');
  }

  return {
    ...mergedOpts,
    buffer: mergedOpts.buffer ?? 1,
  }

}

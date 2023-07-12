import { v4 as uuidv4 } from 'uuid';
import { ChannelOptions } from './types.js';
import { Cmd, CmdType, isRunCmd } from '../api/types.js';
import { measuring } from './measuring.js';

const createChannel = (opts: ChannelOptions) => {
  const channelId = uuidv4();
  console.log(`channel id: ${channelId} created`);

  async function* gen(): AsyncGenerator<Cmd, Cmd, Cmd> {
    const measure = measuring.new();

    let cmd: Cmd = {
      type: CmdType.PAUSE,
    };

    let timer: NodeJS.Timer = null;

    // blocking scope until..
    while (cmd.type !== CmdType.KILL) {
      // if the kill command is set, the while loop is aborted and followed by a return to done state
      cmd = yield cmd;

      if (isRunCmd(cmd)) {
        measure.start();
        // apply interval again
        const c = cmd;

        if (timer) {
          resetInterval(timer);
        }

        timer = applyInterval(timer, 1000 / c.options.perSec, measure, () =>
          opts.callbackFn(c.options),
        );
      }

      if (cmd.type === CmdType.PAUSE) {
        // if the command is of type pause, then we reset the interval but the scope generator still holds
        resetInterval(timer);
      }
    }

    resetInterval(timer);

    console.log(`channel id: ${channelId} generator released`);

    return cmd;
  }
  // must persists
  const g = gen();
  return {
    id: () => channelId,
    init: () => g.next(),
    next: (x: Cmd) => g.next(x),
  };
};

const applyInterval = (
  timer: NodeJS.Timer,
  interval: number,
  measure: ReturnType<typeof measuring.new>,
  callback: () => Promise<unknown>,
) => {
  timer = setInterval(async () => {
    measure.start();
    await callback();
    measure.inc(200, measure.close().duration);
  }, interval);
  return timer;
};

const resetInterval = (timer: NodeJS.Timer) => clearInterval(timer);


export const channel = {
  new: createChannel,
};

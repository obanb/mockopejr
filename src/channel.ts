import { v4 as uuidv4 } from 'uuid';
import { ChannelOptions, Cmd, CmdType } from './types.js';

const createChannel = (opts: ChannelOptions) => {
  const channelId = uuidv4();
  console.log(`channel id: ${channelId} created`);

  async function* fn(): AsyncGenerator<Cmd, void, Cmd> {
    let cmd: Cmd = {
      type: CmdType.PAUSE,
    };

    const interval = setInterval(async () => {
      if (cmd.type === CmdType.KILL || cmd.type === CmdType.PAUSE) {
        clearInterval(interval);
        console.log(
          `channel id: ${channelId} interval cleared by ${cmd.type} signal`,
        );
      } else {
        await opts.callbackFn();
      }
    }, 1000);

    while (cmd.type !== CmdType.KILL) {
      // if the kill command is set, the while loop is aborted and followed by a return to done state
      cmd = yield cmd;
    }
    console.log(`channel id: ${channelId} generator released`);
  }
  const s = fn();
  return {
    init: s.next(),
    next: (x: Cmd) => s.next(x),
  };
};

const group = () => {
  let chans: Record<string, ReturnType<typeof createChannel>> = {};

  return {
    add: (uid: string, chan: ReturnType<typeof createChannel>) => {
      chans[uid] = chan;
    },
    deleteByUid: (uid: string) => {
      delete chans[uid];
    },
    getByUid: (uid: string) => chans[uid],
    purge: () => (chans = {}),
    reload: () => (chans = {}),
  };
};

export const channel = {
  new: createChannel,
  group,
};

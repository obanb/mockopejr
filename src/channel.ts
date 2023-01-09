import { v4 as uuidv4 } from 'uuid';
import { ChannelOptions, Cmd, CmdType } from './types.js';

const createChannel = (opts: ChannelOptions) => {
  const channelId = uuidv4();
  console.log(`channel id: ${channelId} created`);

  async function* gen(): AsyncGenerator<Cmd, Cmd, Cmd> {
    const measure = measuring()

    let cmd: Cmd = {
      type: CmdType.PAUSE,
    };

    let timer: NodeJS.Timer

    // blocking scope until..
    while (cmd.type !== CmdType.KILL) {
      // if the kill command is set, the while loop is aborted and followed by a return to done state
      cmd = yield cmd;

      if(cmd.type === CmdType.PAUSE){
        // if the command is of type pause, then we reset the interval but the scope generator still holds
        resetInterval(timer)
      }

      if(cmd.type === CmdType.RUN){
        measure.start()
        // apply interval again
        timer = applyInterval(timer, 1000, measure, opts.callbackFn)
      }
    }

    resetInterval(timer)

    console.log(`channel id: ${channelId} generator released`);

    return cmd
  }
  // must persists
  const g = gen();
  return {
    id: () => channelId,
    init: () => g.next(),
    next: (x: Cmd) => g.next(x),
  };
};

const measuring = () => {
  const m = {
    start: 0,
    end: 0,
    duration: 0,
    requests: 0,
    avg: 0,
    ok: 0,
    error: 0,
    slowest: 40,
    fastest: 10,
  }

  return {
    start(){
      m.start = Date.now()
    },
    inc: (status: number, duration: number) => {
      m.requests += 1

      if(m.slowest < duration || m.slowest === 0){
        m.slowest = duration
      }

      if(m.fastest > duration || m.fastest === 0){
        m.fastest = duration
      }

      if(status < 400) {
        m.ok += 1
      } else {
        m.error += 1
      }
    },
    update(key: keyof typeof m, value: number){
      m[key] = value
    },
    close(){
      m.end = Date.now()
      m.duration = m.end - m.start
      m.avg = m.duration / m.requests
      return m
    }
  }
}


const applyInterval = (timer: NodeJS.Timer, interval: number, measure: ReturnType<typeof measuring>,callback: () => Promise<unknown>) => {
  timer = setInterval(async() => {
    measure.start()
    await callback()
    measure.inc(200, measure.close().duration)
  }, interval)
  return timer
}

const resetInterval = (timer: NodeJS.Timer) => clearInterval(timer)

const group = () => {
  let chans: Record<string, ReturnType<typeof createChannel>> = {};

  return {
    add: (chan: ReturnType<typeof createChannel>) => {
      chans[chan.id()] = chan;
    },
    deleteByUid: async (uid: string, kill = true) => {
      const chan = chans[uid];

      if (kill) {
        await chan.next({ type: CmdType.KILL });
      }

      delete chans[uid];
    },
    getByUid: (uid: string) => chans[uid],
    purge: () => {
      Object.entries(chans).forEach(async ([_, chan]) => {
        await chan.next({ type: CmdType.KILL });
      });
      chans = {};
    },
    reload: () => (chans = {}),
    list: () => chans,
  };
};

export const channel = {
  new: createChannel,
  group,
};

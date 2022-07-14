import { v4 as uuidv4 } from 'uuid';

type PauseCommand = {
  cmd: 'pause'
}

type KillCommand = {
  cmd: 'kill'
}

type Idle = {
  cmd: 'idle'
}

type Run = {
  cmd: 'run',
  options: ChannelOptions
}


export type ChannelCmd = PauseCommand | KillCommand | Idle | Run

export type ChannelOptions = {
  perSec: number,
  callbackFn: () => Promise<unknown>
}


const createChannel = (opts: ChannelOptions) => {
  const channelId = uuidv4()
  console.log(`channel id: ${channelId} created`)

  async function* fn(): AsyncGenerator<ChannelCmd,void,ChannelCmd> {
    let cmd: ChannelCmd = {
      cmd: 'idle'
    }

    const interval = setInterval(async() => {
      if (cmd.cmd === 'kill' || cmd.cmd === 'pause') {
        clearInterval(interval)
        console.log(`channel id: ${channelId} interval cleared`)
      }else{
        await opts.callbackFn()
      }
    }, 1000 / opts.perSec)

    while(cmd.cmd !== 'kill'){
      // if the kill command is set, the while loop is aborted and followed by a return to done state
      cmd = yield cmd
    }
    console.log(`channel id: ${channelId} generator released`)

  }
  const s = fn()
  return {
    init: s.next(),
    next: (x:ChannelCmd) => s.next(x),
  }
}

export const channel = {
  new: createChannel
}

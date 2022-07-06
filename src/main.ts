import { requestListener, routing } from './routing.js';
import * as http from 'http';

const reqHolder = {
  mirror: null,
  apply: null,
}

const createChannel = () => {
  function* fn(): Generator<unknown,void,string> {
    let txt = ''
    const t = setInterval(() => {
      if (txt === 'stop') {
        console.log('stopuju')
        clearInterval(t)
      }
      console.log("operace")
    }, 1000)
    while(txt !== 'stop'){
      txt = yield
    }
  }
  const s = fn()
  return (x?:string) => s.next(x)
}

const routeTable: Record<string, (req: http.IncomingMessage, res: http.ServerResponse, args: unknown) => unknown> = {
  'get/info': ((_, res) => {
    res.writeHead(200)
    res.end('ok')
  }),
  'get/mirror': ((_, res) => {
    res.writeHead(200)
    res.end(JSON.stringify(reqHolder.mirror.body))
  }),
  'post/mirror': ((req, res, args) => {
    reqHolder.mirror = {}
    reqHolder.mirror["request"] = req
    reqHolder.mirror["body"] = args
    const g = createChannel()

    g("feef")
    g("fefe")

    setInterval(() => {
      g('stop')
    } , 10000)

    res.writeHead(200)
    res.end('ok')
  }),
  'post/apply': ((_, res) => {
    res.writeHead(200)
    res.end('ok')
  })
}


export function main(){
  const router = routing.createRouter(routeTable)
  const listener = requestListener(router)
  const server = http.createServer(listener);
  const proxy = http.createServer(listener);
  server.listen(8090)
  proxy.listen(8091)
}

import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';

const _HTTP_CONTENT_TYPE = 'application/json'
const _HTTP_ENCODING = 'application/json'

const httpGateKeeper = (req: IncomingMessage) => {
  const ct = req.headers["content-type"]
  if(!ct.includes(_HTTP_CONTENT_TYPE)){
    throw new Error('Unsupported content type header.')
  }

  const a = req.headers["accept"]
  if(!a.includes(_HTTP_ENCODING)){
    throw new Error('Unsupported accept header.')
  }
}


export const getUrlPath = (uri: string) => url.parse(uri).pathname

export const getQueryParams = (uri: string) => {
  const path = url.parse(uri).path
  const results = path.match(/\?(?<query>.*)/);
  const { groups: { query } } = results;
  const params = query.match(/(?<param>\w+)=(?<value>\w+)/g);
  return params
}

export const getQueryParamsPairs = (params: string[]) => {
  const pairs =  params.reduce((acc, next) => {
    const [param, value] = next.split('=')
    acc[param] = value
    return acc
  },{})

  return pairs;
}


const routeTable: Record<string, (req: IncomingMessage, res: ServerResponse) => unknown> = {
  'get/info': ((_, res) => {
      res.writeHead(200)
      res.end('ok')
  })
}

const createRouter = (routerTable: Record<string, (req: IncomingMessage, res: ServerResponse) => unknown>) => (req: IncomingMessage, res: ServerResponse) => {
   const method = req.method.toLowerCase()
   const routes = Object.keys(routerTable)

   let found = false
   for(const route of routes){
       const path = getUrlPath(req.url)
       const key = `${method}${path}`
     console.log(key)
       if(key === route){
          found = true
          routerTable[key](req, res)
          break
       }
   }

   if(!found){
      res.writeHead(404)
      res.end('url not found')
   }
}


const requestListener = function (req: IncomingMessage, res: ServerResponse) {
  try {
    httpGateKeeper(req)
    const router = createRouter(routeTable)
    router(req, res)
  }catch(e){
    res.writeHead(400)
    res.end(e.message)
  }
}

export function main(){
  const server = http.createServer(requestListener);
  server.listen(8090)
}

import { IncomingMessage, ServerResponse } from 'http';
import * as url from 'url';

const _HTTP_CONTENT_TYPE = 'application/json'
const _HTTP_ENCODING = 'application/json'

const httpGateKeeper = (req: IncomingMessage) => {
  const contentType = req.headers["content-type"]
  if(!contentType.includes(_HTTP_CONTENT_TYPE)){
    throw new Error('Unsupported content type header.')
  }

  const accept = req.headers["accept"]
  if(!accept.includes(_HTTP_ENCODING)){
    throw new Error('Unsupported accept header.')
  }
}

export const getUrlPath = (uri: string) => url.parse(uri).pathname

const getQueryParams = (uri: string) => {
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

const createRouter = (routerTable: Record<string, (req: IncomingMessage, res: ServerResponse, args: unknown) => unknown>) => {
  const routes = Object.keys(routerTable)

  return {
    route: (req: IncomingMessage, res: ServerResponse) => {
      const method = req.method.toLowerCase()

      let found = false
      for(const route of routes){
        const path = getUrlPath(req.url)
        const key = `${method}${path}`
        if(key === route){
          found = true

          if(method === 'get'){
            // TODO
            routerTable[key](req, res, {})
            break
          }

          else if(method === 'post'){
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            })
            req.on('end', () => {
              const json = JSON.parse(body)
              routerTable[key](req, res, json)
            })
            break
          }

          else {
            res.writeHead(404)
            res.end('not supported http method')
            break
          }
        }
      }

      if(!found){
        res.writeHead(404)
        res.end('url not found')
      }
    }
  }
}

export const requestListener = (router: {route: (req: IncomingMessage, res: ServerResponse) => void}) => (req: IncomingMessage, res: ServerResponse) => {
  try {
    httpGateKeeper(req)
    router.route(req, res)
  }catch(e){
    res.writeHead(400)
    res.end(e.message)
  }
}

export const routing = {
  getUrlPath,
  getQueryParamsPairs,
  getQueryParams,
  httpGateKeeper,
  createRouter,
  requestListener,
}

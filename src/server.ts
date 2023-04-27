import http from 'http';
import { RouterTable } from './types.js';
import { routing } from './routing.js';


const runServer = (port: number, routerTable: RouterTable, desc = '') => {
  const router = routing.createRouter(routerTable);
  const listener = routing.requestListener(router);
  const server = http.createServer(listener);
  server.listen(port);
  console.log(`${desc} server listening on port ${port}`);
  return server;
};

export const server = {
  runServer,
};


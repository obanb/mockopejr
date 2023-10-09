import { controllers } from './api/controllers.js';
import { plugableServer } from './api/plugableServer.js';
import { charts } from './core/charts.js';

const {
  APP_PORT = 3333,
} = process.env;



export const main = async() => {
  console.log('Logr started..');

  const srvr = plugableServer.new({ port: Number(APP_PORT), desc: 'app' }, {'post/graphql':() => Promise.resolve({}),http:{}});

  const chartGroup = charts.group(srvr);

  await charts.reload(chartGroup)()

  srvr.setRouter(controllers.appController(chartGroup));

  srvr.run();
}

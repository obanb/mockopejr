import {Server} from 'node:http';
import express, { Router } from 'express';
import { parseRequestParams } from 'graphql-http/lib/use/http';

const app = express();
const port = process.env.APP_PORT;

const routa = () => {
  const expressRouter = Router();
  expressRouter.get('/pes',() => {
    console.log('helo from srv')
  });

  return expressRouter
}

export const startServer = async () => {
   await new Promise<Server>((resolve) => {
    const httpServer = app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
      resolve(httpServer);
    });
  });

  app.use(express.json({limit: '50mb'}));


  app.use('/api',routa())

};

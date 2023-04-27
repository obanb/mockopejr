import {Router, Request, Response} from 'express';

export const serviceController = (state: Record<string, unknown>) => {
    const expressRouter = Router();

    expressRouter.get('/api/hoteltime', async (req: Request, res: Response) => {
        res.sendStatus(200);
    });

    expressRouter.prototype


    return expressRouter;
}


import express from 'express';
import authenticationMiddleware from '$/middlewares/auth';
import type App from '$/lib/app';
import { generateTokenForUser } from '$/passport-auth/lib';

const routes = (app: App): void => {
  const router: express$Router = express.Router();

  router.get('/me', authenticationMiddleware, (req: exExpress$Request, res: express$Response) => {
    return res.json(req.user);
  });

  router.post('/logout', authenticationMiddleware, (req: exExpress$Request, res: express$Response) => {
    req.logout();
    res.json({ success: true });
  });

  app.registerRoute('/api/v1/member', router);
};

module.exports = routes;

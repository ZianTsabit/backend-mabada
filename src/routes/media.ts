import { Router } from 'express';

import { getMediaFile } from '../controllers/media';

export const mediaRouter = Router();


mediaRouter
    .get('/', getMediaFile)
    ;

export default mediaRouter;
import { Router } from "express";
import { getUsers, addSeller, getUser } from '../controllers/user';
import { auth } from "../middlewares/auth";

export const usersRouter = Router();

usersRouter
    .get('/', getUsers)
    .get('/:uuid', auth(true), getUser)
    .post('/register',auth(true), addSeller);

export default usersRouter;

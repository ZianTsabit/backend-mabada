import { Router } from "express";
import { getUsers, addSeller } from '../controllers/user';
import { auth } from "../middlewares/auth";

export const usersRouter = Router();

usersRouter
    .get('/', getUsers)
    .post('/add-seller',auth(true), addSeller);

export default usersRouter;

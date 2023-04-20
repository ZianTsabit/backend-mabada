import { Router } from "express";
import { login } from '../controllers/auth';
import { auth } from "../middlewares/auth";

export const authRouter = Router();

authRouter
    .post('/login', login);

export default authRouter;

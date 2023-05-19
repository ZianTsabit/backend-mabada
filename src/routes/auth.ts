import { Router } from "express";
import { login, logout } from '../controllers/auth';
import { auth } from "../middlewares/auth";

export const authRouter = Router();

authRouter
    .post('/login', login)
    .post('/logout',logout);
export default authRouter;

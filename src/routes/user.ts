import { Router } from "express";
import { getUsers, addSeller, getUser, editUser, deleteUser, } from '../controllers/user';
import { auth } from "../middlewares/auth";

export const usersRouter = Router();

usersRouter
    .get('/', getUsers)
    .get('/:uuid', getUser)
    .post('/edit',editUser)
    .post('/register', addSeller)
    .delete('/delete/:uuid',auth(true), deleteUser)
    ;

export default usersRouter;

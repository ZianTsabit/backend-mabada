import { Router } from "express";
import { createCategory, getCategories, getCategory, updateCategory, deleteCategory } from '../controllers/category';
import { auth } from "../middlewares/auth";

export const categoryRouter = Router();

categoryRouter
    .post('/', createCategory)
    .get('/', getCategories)
    .get('/:uuid', auth(true), getCategory)
    .put('/:uuid', auth(true), updateCategory)
    .delete('/:uuid', auth(true), deleteCategory);

export default categoryRouter;
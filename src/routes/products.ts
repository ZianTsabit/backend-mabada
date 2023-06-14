import { Router } from "express";
import { createProduct, getProduct, getProducts, updateProduct, deleteProduct } from '../controllers/products';
import { auth } from "../middlewares/auth";

export const productsRouter = Router();

productsRouter
    .post('/', createProduct)
    .get('/', getProducts)
    .get('/:uuid', auth(true), getProduct)
    .put('/:uuid', auth(true), updateProduct)
    .delete('/:uuid', auth(true), deleteProduct);

export default productsRouter;

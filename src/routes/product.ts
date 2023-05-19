import { Router } from 'express';
import { getProducts, createProduct, editProduct, categories, productcategories, getProductById, deleteProduct } from '../controllers/product';
import { auth } from "../middlewares/auth";

export const productRouter = Router();

productRouter
    .get('/', getProducts)
    .get('/get/:id', getProductById)
    .get('/categories', categories)
    .get('/prodcat', productcategories)
    .post('/add',auth(true), createProduct)
    .put('/edit/:id', editProduct)
    .delete('/:id', deleteProduct)
    ;
    

export default productRouter;
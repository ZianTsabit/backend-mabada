import { Router } from 'express';
import { getProducts, editProduct, categories, productcategories, getProductById, deleteProduct, createProduct, userprod, getMedia, getProductByuser } from '../controllers/product';
import { auth } from "../middlewares/auth";

export const productRouter = Router();

productRouter
    .get('/', getProducts)
    .get('/get/:id', getProductById)
    .get('/categories', categories)
    .get('/media', getMedia)
    .get('/user', userprod)
    //admin routes
    .get('/myproduct', getProductByuser)
    .get('/prodcat', productcategories)
    .post('/create', createProduct) 
    .put('/:uuid/edit/:id', editProduct)
    .delete('/:id', deleteProduct)
    ;
    

export default productRouter;
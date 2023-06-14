import { Router } from 'express';
import { getProducts, editProduct, categories, productcategories, deleteProduct, createProduct, userprod, getMedia, getProductByuser, getProductById } from '../controllers/product';
import { auth } from "../middlewares/auth";
import { get } from 'http';
import { getMediaFile } from '../controllers/media';

export const productRouter = Router();

productRouter
    .get('/', getProducts)
    .get('/get/:uuid', getProductById)
    .get('/categories', categories)
    .get('/user', userprod)
    .get('/my', getProductByuser)
    .get('/prodcat', productcategories)
    .post('/create', createProduct) 
    .put('/:uuid/edit', editProduct)
    .delete('/:uuid', deleteProduct)
    ;
    

export default productRouter;
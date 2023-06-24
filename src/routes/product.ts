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
    .get('/my',auth(true,true), getProductByuser)
    .get('/prodcat', productcategories)
    .post('/create', auth(true,true),createProduct) 
    .put('/:uuid/edit',auth(true,true), editProduct)
    .delete('/:uuid', auth(true,true), deleteProduct)
    ;
    

export default productRouter;
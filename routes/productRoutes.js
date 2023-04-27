import express from 'express';
import { allListedProducts, selectedProduct } from '../controller/productController.js';

const router = express.Router();

router.get('/product', allListedProducts);

router.get('/:id', selectedProduct);



export default router;
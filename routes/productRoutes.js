import express from 'express';
import { allListedProducts } from '../controller/productController.js';

const router = express.Router();

router.get('/product', allListedProducts);

export default router;
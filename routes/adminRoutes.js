import express from 'express';
import { isAdmin } from '../middleware/utilsAuth.js';
import { addNewProdct, addNewImg, removeProdct } from '../controller/adminController.js';

const router = express.Router();

router.use(isAdmin);

router.post('/add-new-product', addNewProdct);

router.post('/add-product-img', addNewImg);

router.delete('/delete-product', removeProdct);


export default router;
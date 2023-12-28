import express from 'express';
import { customerAddItem, customerCart, customerRemoveItem, modifyItem } from '../controller/cartController.js';

const router = express.Router();

router.post('/cart-items', customerCart);

router.put('/add-to-cart', customerAddItem);

router.delete('/remove-item', customerRemoveItem);

router.put('/modify-item', modifyItem);

export default router;
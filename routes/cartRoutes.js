import express from 'express';
import { customerAddItem, customerCart, customerRemoveItem, modifyItem } from '../controller/cartController.js';
import { verfiyToken } from '../middleware/tokenValid.js';


const router = express.Router();

router.post('/items',verfiyToken, customerCart);

router.put('/add-to-cart', customerAddItem);

router.delete('/remove-item', customerRemoveItem);

router.put('/modify-item', modifyItem);

export default router;
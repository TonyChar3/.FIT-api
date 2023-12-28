import express from 'express';
import { addToWishList, removeFromWishList, allWishList } from '../controller/wishListController.js';
import { AuthVerification } from '../middleware/utilsAuth.js';

const router = express.Router();

router.use(AuthVerification);

router.get('/Wishlist', allWishList);

router.post('/addWishlist', addToWishList);

router.delete('/removeWishlist', removeFromWishList );

export default router;


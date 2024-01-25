import express from 'express';
import { addToWishList, removeFromWishList, allWishList } from '../controller/wishListController.js';
import { AuthVerification } from '../middleware/utilsAuth.js';

const router = express.Router();

router.get('/Wishlist', AuthVerification, allWishList);

router.post('/addWishlist', AuthVerification, addToWishList);

router.delete('/removeWishlist', AuthVerification, removeFromWishList );

export default router;


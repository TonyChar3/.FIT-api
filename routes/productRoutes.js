import express from 'express';
import passport from 'passport';
import { allListedProducts, addToWishList, removeFromWishList, allWishList } from '../controller/productController.js';

const router = express.Router();

router.get('/product', allListedProducts);

router.post('/addWishlist', passport.authenticate('jwt', { session: false }), addToWishList);

router.delete('/removeWishlist', passport.authenticate('jwt', { session: false }), removeFromWishList );

router.get('/wishlist', passport.authenticate('jwt', { session: false }), allWishList);

export default router;
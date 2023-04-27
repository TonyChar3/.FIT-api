import express from 'express';
import passport from 'passport';
import { addToWishList, removeFromWishList, allWishList } from '../controller/wishListController.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }))

router.get('/Wishlist', allWishList);

router.post('/addWishlist', addToWishList);

router.delete('/removeWishlist', removeFromWishList );

export default router;


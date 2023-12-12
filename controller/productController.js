import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { redis_products_storage } from '../server.js';
import { cookiesIdentityVerification } from '../middleware/utilsAuth.js';

/**
 * Controller for the products of the shop
 */

//@desc Show all of the listed products
//@route GET /shop/product
//@access PUBLIC
const allListedProducts = asyncHandler( async(req,res,next) => {
    try{
        // verify the identity
        await cookiesIdentityVerification(req,res);
        // verify the cache if they're already set
        const isCached = await redis_products_storage.get('listed_products');
        //if they're not cached
        if(!isCached){
            const products = await Product.find();
            await redis_products_storage.set('listed_products', JSON.stringify(products), "EX", 3600);
            res.status(200).send(products);
        }
        // if they are cached
        res.status(200).send(JSON.parse(isCached));
    } catch(err){
        next(err);
    }
});

export { allListedProducts }
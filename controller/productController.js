import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });


//@desc Show all of the listed products
//@route GET /shop/product
//@access PUBLIC
const allListedProducts = asyncHandler( async(req,res,next) => {
    try{
        // cache key of the products
        const cacheKey = 'store-products';

        // check if the data is cached
        if(cache.has(cacheKey)){
            // data from the cache
            const cachedData = cache.get(cacheKey);
            const productsFromCache = JSON.parse(cachedData);

            // send back the cached data
            res.status(200).send(productsFromCache)
        } else {
            // loop through the Product document for each listed products
            const products = await Product.find();
            // if the products were found
            if(products){
                // stringify using JSON
                const cacheValue = JSON.stringify(products)
                // Cache the products
                cache.set(cacheKey, cacheValue)
                // send back the products 
                res.status(200).send(products);
            }
        }
        
    } catch(err){
        next(err);
    }
});

//@desc Show a selected product
//@route GET /shop/:id
//@access PUBLIC
const selectedProduct = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the product id from the request
        const prodct_id = req.params.id
        // the single product ID set as the cache key
        const cacheKey = `${prodct_id}`

        if(cache.has(cacheKey)){
            const cachedData = cache.get(cacheKey);
            const productFromCache = JSON.parse(cachedData)
            res.status(200).json(productFromCache)
        } else {
            // find the product
            const product = await Product.findOne({ _id: prodct_id })
            // If no product is found
            if(!product){
                res.status(404);
                throw new Error("Product not found")
            }else{
                const cacheValue = JSON.stringify(product)
                cache.set(cacheKey,cacheValue)
                res.status(200).json(product)
            }
        }

    } catch(err){
        next(err)
    }
});

export { allListedProducts, selectedProduct }
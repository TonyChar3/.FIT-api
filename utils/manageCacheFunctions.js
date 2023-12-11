import { redis_products_storage } from "../server.js"
import Product from '../models/productModel.js';

/**
 * Functions for the cache
 */

/**
 * Function to find a find in the Cached product array
 */
const findCachedProduct = async(product_id) => {
    try{
        // get the whole array
        const cached_array = await redis_products_storage.get('listed_products');
        if(!cached_array){
            // if not found look in the DB directly
            const db_product = await Product.findOne({ _id: product_id })
            return {
                found: true,
                obj: db_product
            }
        }
        // find the product w/ id
        const product_array = JSON.parse(cached_array);
        const found_product = product_array.find((prodct) => prodct._id === product_id);
        return {
            found: true,
            obj: found_product
        }
    } catch(err){
        return {
            error: true,
            error_msg: 'Cannot find the product or the cached array'
        }
    }
}

export { findCachedProduct }
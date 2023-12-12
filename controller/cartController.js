import asyncHandler from 'express-async-handler';
import { redis_cart_storage } from '../server.js';
import { findCachedProduct } from '../utils/manageCacheFunctions.js';
import { cookiesIdentityVerification } from '../middleware/utilsAuth.js';

/**
 * Controllers for the cart actions
 */

//@desc show all the item of the cart
//@route GET /cart/items
//@access PUBLIC
const customerCart = asyncHandler( async(req,res,next) => {
    try{
        // verify the identity of the request
        const user_cart_id = await cookiesIdentityVerification(req);
        // verify the cache for the cart
        const cart_isCached = await redis_cart_storage.get(`${user_cart_id}`);
        // if it is not found in the cache
        if(!cart_isCached){
            // create a new cart
            const new_user_cart = {
                _id: user_cart_id,
                products: []
            }
            // if the user is authenticated
            if(req.isAuthenticated() && req.user){
                // set the authenticated user cart to expire after 48 hours
                await redis_cart_storage.set(user_cart_id, JSON.stringify(new_user_cart), "EX", 172800)
                // send back the cart
                res.status(200).send(new_user_cart);
            } else {
                // set a new cached cart object for 30 min
                await redis_cart_storage.set(user_cart_id, JSON.stringify(new_user_cart), "EX", 3600);
                // send back the cart
                res.status(200).send(new_user_cart);
            }
        } else if (cart_isCached){
            // send it back to the frontend
            const cached_cart = JSON.parse(cart_isCached);
            res.status(200).send(cached_cart);
        }
    } catch(err){
        next(err);
    }
});

//@desc add item to the cart
//@route PUT /cart/add-to-cart
//@access PUBLIC
const customerAddItem = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the product properties
        const { prodct_id, prodct_qty } = req.body;
        // verify the user identity
        const user_cart_id = await cookiesIdentityVerification(req,res);
        // verify both cache
        const [product_isCached, cart_isCached] = await Promise.all([
            // find the product in the cache product array
            findCachedProduct(prodct_id),
            // find the cart in the cache
            redis_cart_storage.get(`${user_cart_id}`)
        ]);

        // get the product
        const selected_product = product_isCached.obj;
        // get the cart
        const cart = JSON.parse(cart_isCached);

        // check if the product isn't already added
        const isAdded = cart.products.findIndex(prodcts => prodcts._id.toString() === prodct_id.toString());
        if(isAdded !== -1){
            cart.products[isAdded].qty += 1
            await redis_cart_storage.set(user_cart_id, JSON.stringify(cart),"EX",3600);
            res.send({ message: "Qty updated"});
        } else if(isAdded === -1) {
            const new_item = {
                _id: selected_product._id,
                img: selected_product.images[0].img_url,
                name: selected_product.name,
                stripe_ID: selected_product.stripe_ID,
                qty: prodct_qty,
                price: selected_product.prix
            }
            // push it to the array
            cart.products.push(new_item);
            // cache it again
            await redis_cart_storage.set(user_cart_id, JSON.stringify(cart), "EX", 3600);
        }
        res.status(200).send({ message: 'Item added'})
    } catch(err){
        next(err);
    }
});

//@desc delete item from the cart
//@route DELETE /cart/remove-item
//@access PUBLIC
const customerRemoveItem = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the product properties
        const { prodct_id } = req.body;
        // verify the user identity
        const user_cart_id = await cookiesIdentityVerification(req,res);
        // find the cart in the cache
        const cached_cart = JSON.parse(await redis_cart_storage.get(`${user_cart_id}`));
        // find the index of the item inside the products array
        const find_item = cached_cart.products.findIndex(prodct => prodct._id.toString() === prodct_id.toString());
        // remove it from the array
        cached_cart.products.splice(find_item, 1);
        // set it back
        await redis_cart_storage.set(user_cart_id, JSON.stringify(cached_cart), "EX", 3600);
        res.json({ message: "Item removed"});
    }catch(err){
        next(err);
    }
});

//@desc modify the quantity of an Item
//@route PUT /cart/modify-qty
//@access PUBLIC
const modifyItem = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the product properties
        const { prodct_id, modif_action } = req.body;
        // verify the user identity
        const user_cart_id = await cookiesIdentityVerification(req,res);
        // get the cart from the cache
        const cached_cart = JSON.parse(await redis_cart_storage.get(`${user_cart_id}`));
        // find the item inside the cart
        const cart_item_index = cached_cart.products.findIndex((prodct) => prodct._id.toString() === prodct_id.toString())
        if(cart_item_index === -1){
            return;
        }
        switch (modif_action){
            case 'decrement':
                if(cached_cart.products[cart_item_index].qty > 0){
                    cached_cart.products[cart_item_index].qty -= 1
                    if(cached_cart.products[cart_item_index].qty === 0){
                        cached_cart.products.splice(cart_item_index,1);
                        break;
                    }
                    break;
                }
            case 'increment':
                if(cached_cart.products[cart_item_index].qty >= 0){
                    cached_cart.products[cart_item_index].qty += 1
                    break;
                }
            default:
                break;
        }
        // save the update to redis
        await redis_cart_storage.set(user_cart_id, JSON.stringify(cached_cart),"EX", 3600);
        // send back success response
        res.status(200).send({ message: "Qty updated"});
    } catch(err){
        next(err);
    }
});

export { customerAddItem, customerCart, customerRemoveItem, modifyItem };
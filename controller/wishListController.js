import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { findCachedProduct } from '../utils/manageCacheFunctions.js';

/**
 * Controllers to handle the authenticated user wishlist
 */

//@desc Add product to the wishlist
//@route POST /shop/addWishlist
//@access PRIVATE
const addToWishList = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the given product id from the request.body
        const { prodct_id } = req.body
        // find the auth user info + the product he wants to add
        const [user, product] = await Promise.all([
            User.findOne({ _id: req.user.id }),
            findCachedProduct(prodct_id)
        ]);
        // check if the product is not already added to the wishlist
        const isAdded = user.wishlist.findIndex(prodct => prodct._id.toString() === prodct_id.toString());
        // if the product is already added
        if(isAdded !== -1){
            res.status(200).json({ message: "already added to your wishlist"});
        } else {
            // add it to the array
            await User.updateOne({
                $push: {
                    wishlist: {
                        _id: prodct_id,
                        prodct_img: product.images[0].img_url,
                        prodct_name: product.name,
                        prodct_price: product.prix
                    }
                }
            });
            res.status(201).json({ message: 'added to the wishlist' });
        }
    } catch(err){
        next(err);
    }
});

//@desc Remove product from the wishlist
//@route DELETE /shop/removWishlist
//@access PRIVATE
const removeFromWishList = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the given product id from the request.body
        const { prodct_id } = req.body
        // find the current user wishlist
        const user = await User.findOne({ _id: req.user.id });
        if(!user){
            res.status(500);
            throw new Error("You are no longer logged in, please log in again");
        }
        // find the product in the wishlist
        const wishIndex = user.wishlist.findIndex(prodct => prodct._id.toString() === prodct_id.toString());
        if(wishIndex !== -1){
            // delete the product from the wishlist
            const deleted = user.wishlist.splice(wishIndex, 1);
            //save the update
            await user.save()
        }
        // successful operation message
        res.status(200).json({ message: "Removed from wishlist"});
    } catch(err){
        next(err);
    }
});

//@desc See every product in the wishlist
//@route GET /shop/wishlist
//@access PRIVATE
const allWishList = asyncHandler( async(req,res,next) => {
    try{
        let wish_list_items = [];
        // fetch the current user
        const user = await User.findOne({ _id: req.user.id })
        if(!user){
            res.status(401);
            throw new Error("You're no longer logged in");
        }

        if(user.wishlist.length === 0){
            res.status(200).send({ message: "Nothing in the wishlist :("});
        } else {
            // loop through the wishlist
            user.wishlist.forEach(prodct => {
                wish_list_items.push(prodct)
            });
            // if the wishList array isn't empty
            if(wish_list_items.length !== 0){
                res.status(200).send(wish_list_items);
            }
        }
    } catch(err){
        next(err)
    }
});

export {addToWishList, removeFromWishList, allWishList}
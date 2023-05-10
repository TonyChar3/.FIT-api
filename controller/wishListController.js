import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

//@desc Add product to the wishlist
//@route POST /shop/addWishlist
//@access PRIVATE
const addToWishList = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the given product id from the request.body
        const { prodct_id } = req.body
        // Get the current logged in user
        const user = await User.findOne({ _id: req.user.id });
        // if the user is not found
        if(!user){
            res.status(500);
            throw new Error("Error, please log in again");
        }

        // find the product info in the product collection
        const product = await Product.findOne({ _id: prodct_id });
        // if the product is not found...
        if(!product){
            res.status(404);
            throw new Error("The selected product does not exist anymore");
        }

        // check if the product is not already added to the wishlist
        const isAdded = user.wishlist.findIndex(prodct => prodct._id.toString() === prodct_id.toString());
        // if the product is already added
        if(isAdded !== -1){
            res.status(200).json({ message: "already added to your wishlist"});
        } else {
            // Create a new wishlist object
            const newWish = {
                _id: prodct_id,
                prodct_img: product.images[0].img_url,
                prodct_name: product.name,
                prodct_price: product.prix
            }
            // add it to the array
            const addNewWish= await user.updateOne({
                $push: {
                    wishlist: newWish
                }
            })
            await user.save();

            // generate a success or failure message
            if(addNewWish){
                res.status(201).json({ message: 'added to the wishlist' });
            } else {
                res.status(500);
                throw new Error("Unable to add this product to the wishlist, please try again");
            }
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
        // the user is not found...
        if(!user){
            res.status(500);
            throw new Error("You are no longer logged in, please log in again");
        }

        // find the product in the wishlist
        const wishIndex = user.wishlist.findIndex(prodct => prodct._id.toString() === prodct_id.toString());
        // if the product isnt located in the wishlist...
        if(wishIndex !== -1){
            // delete the product from the wishlist
            const deleted = user.wishlist.splice(wishIndex, 1);
            //save the update
            await user.save()
            // successful operation message or error message
            if(deleted){
                res.status(200).json({ message: "Removed from wishlist"});
            } else {
                res.status(500);
                throw new Error("Error trying to remove product from your wishlist, please try again");
            }
        } else {
            res.status(404);
            throw new Error("Product not found in the wishlist");
        }
    } catch(err){
        next(err);
    }
});

//@desc See every product in the wishlist
//@route GET /shop/wishlist
//@access PRIVATE
const allWishList = asyncHandler( async(req,res,next) => {
    try{
        // fetch the current user
        const user = await User.findOne({ _id: req.user.id })
        // if no user is found
        if(!user){
            res.status(401);
            throw new Error("You're no longer logged in");
        }

        if(user.wishlist.length === 0){
            res.send({ message: "Nothing in the wishlist :("});
        } else {
            let wishArray = [];
            // loop through the wishlist
            user.wishlist.forEach(prodct => {
                wishArray.push(prodct)
            })
            // if the wishList array isn't empty
            if(wishArray.length !== 0){
                res.status(200).send(wishArray);
            } else {
                res.status(500);
                throw new Error("Unable to show the wishlist please try again");
            }
        }
    } catch(err){
        next(err)
    }
});

export {addToWishList, removeFromWishList, allWishList}
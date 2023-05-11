import asyncHandler from 'express-async-handler';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';


//@desc show all the item of the cart
//@route GET /cart/items
//@access PUBLIC
const customerCart = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the hash and token from the body
        const { hash, userId } = req.body;
        // separate the Bearer and the token parts
        const tokenParts = req.headers.authorization.split(" ")
        // the cart ID variable
        let cartID;

        // If the hash is not empty and userID is empty -> compare it with the token to make sure it is valid
        if(hash && !userId._id){
            //  and use the hash as a cart ID
            cartID = hash
        
        // If it is empty but userID is not empty -> try to find the user id in the user DB
        } else if(!hash && userId._id){
            //  and use the id as a cart ID
            cartID = userId._id
        }
        
        if(cartID){
            // find a cart using this token as the id
            const cart = await Cart.findOne({ _id: cartID })

            // If not found...create a new cart in the DB
            if(!cart){

                // create a new cart in the DB
                const newCart = await Cart.create({
                    _id: cartID,
                    jwt: tokenParts[1]
                })

                if(newCart){
                    // send back its empty value to the frontend
                    const cart = await Cart.findOne({ _id: cartID });
                    
                    if(cart){
                        res.status(200).send(cart)
                    }
                } else {
                    res.status(500);
                    throw new Error("Server unable to create a new Cart for the customer")
                }
            } else if(cart){
                res.send(cart.products);
            }
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
        const { cartID, prodct_id, prodct_qty} = req.body;
        // find the customer cart inside the db
        const cart = await Cart.findOne({ _id: cartID });

        if(!cart){
            res.status(500);
            throw new Error("No cart is currently avaible please reload the application or contact support")
        }

        // find the product
        const product = await Product.findOne({ _id: prodct_id })

        if(!product){
            res.status(500);
            throw new Error("Product not avaible, please reload the application or contact support")
        }

        // check if the product isn't already added
        const isAdded = cart.products.findIndex(prodcts => prodcts._id.toString() === prodct_id.toString());

        if(isAdded !== -1){

            cart.products[isAdded].qty = cart.products[isAdded].qty + prodct_qty

            await cart.save();

            res.send({ message: "Qty updated"})

        } else {

            const newItem = {
                _id: prodct_id,
                img: product.images[0].img_url,
                name: product.name,
                stripe_ID: product.stripe_ID,
                qty: prodct_qty,
                price: product.prix
            }

            const addNewItem = await cart.updateOne({
                $push:{
                    products: newItem
                }
            })

            await cart.save();

            if(addNewItem){
                res.json({ message: "Item added to the cart"})
            } else {
                res.status(500);
                throw new Error("Unable to add this item to the cart")
            }
        }

    } catch(err){
        next(err)
    }
});

//@desc delete item from the cart
//@route DELETE /cart/remove-item
//@access PUBLIC
const customerRemoveItem = asyncHandler( async(req,res,next) => {

    try{
        // deconstruct the product properties
        const { cartID, prodct_id } = req.body;

        // find the cart
        const cart = await Cart.findOne({ _id: cartID })

        if(!cart){
            res.status(404);
            throw new Error("No carts was found")
        }

        // find the index of the item inside the products array
        const findItem = cart.products.findIndex(prodct => prodct._id.toString() === prodct_id.toString());

        if(findItem !== -1){

            const deleted = cart.products.splice(findItem, 1)

            await cart.save();

            if(deleted){
                res.json({ message: "Item removed"})
            } else{
                res.status(500);
                throw new Error("Unable to remove the item from the cart")
            }

        } else {
            res.status(404);
            throw new Error("Unable to find the item to remove from the cart...")
        }

    }catch(err){
        next(err)
    }
});

//@desc modify the quantity of an Item
//@route PUT /cart/modify-qty
//@access PUBLIC
const modifyItem = asyncHandler( async(req,res,next) => {

    try{
        // deconstruct the product properties
        const { cartID, prodct_id, modif_action } = req.body;

        // find the cart
        const cart = await Cart.findOne({ _id: cartID })

        if(!cart){
            res.status(404);
            throw new Error("No carts was found")
        }

        // find the item inside the cart
        const cartItem = cart.products.findIndex((prodct) => prodct._id.toString() === prodct_id.toString())

        if(cartItem !== -1){
            
            switch (modif_action){

                case 'decrement':
                    if(cart.products[cartItem].qty > 0){

                        cart.products[cartItem].qty = cart.products[cartItem].qty - 1

                        if(cart.products[cartItem].qty === 0){

                            cart.products.splice(cartItem,1)

                            await cart.save();
                            res.json({ message: "Quantity decreased"})
                            break;
                        }

                        await cart.save()

                        res.json({ message: "Quantity decreased"})
                        break;
                    }

                case 'increment':
                    if(cart.products[cartItem].qty >= 0){
                        cart.products[cartItem].qty = cart.products[cartItem].qty + 1

                        await cart.save();

                        res.json({ message: "Quantity increased"})
                        break;
                    }

                default:
                    break;
            }
            
        } else {
            res.status(404);
            throw new Error("The product wasn't found in your cart, we're unable to increment the quantity")
        }
    } catch(err){
        next(err)
    }
});

export { customerAddItem, customerCart, customerRemoveItem, modifyItem };


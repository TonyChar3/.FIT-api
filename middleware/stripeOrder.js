import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';

/**
 *  Function to create a new Order form the checkout in our DB
 * @param {Stripe customer data from the checkout} customer 
 * @param {data from the checkout} data 
 */

const createOrder = async(customer, data) => {

    try{
        const cartitems = JSON.parse(customer.metadata.cart)

        const newOrder = await Order.create({
            userId: customer.metadata.userId,
            stripeUID: data.customer,
            paymentIntentId: data.payment_intent,
            products: cartitems,
            subtotal: data.amount_subtotal,
            total: data.amount_total,
            shipping: data.customer_details,
            payment_status: data.payment_status
        });

        if(newOrder){
            console.log('process order', newOrder)
        } else {
            res.status(500);
            throw new Error("Unable to create a new order")
        }               
    } catch(err){
        console.log(err)
    }

}

/**
 * Function to clear of the user's cart data
 *
 */

const clearCartData = async(cartID) => {
    try{
        // find the cart
        const cart = await Cart.findOne({ _id: cartID })

        if(!cart){
            return;
        }

        // clear all the data inside
        cart.products = [];

        await cart.save();

    } catch(err){
        console.log(err)
    }
}

export {createOrder, clearCartData}
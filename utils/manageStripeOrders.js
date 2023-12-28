import Order from '../models/orderModel.js';
import { redis_cart_storage } from '../server.js';

/**
 * Functions to handle the Orders and Stripe checkout webhook
 */

/**
 *  Function to create a new Order form the checkout in our DB
 */
const createOrder = async(customer, data) => {
    try{
        // get the items from the callback
        const cartitems = JSON.parse(customer.metadata.cart);
        // make the items fit to the order product model
        const order_items_array = cartitems.map(items => {
            return {
                _id: items._id,
                qty: items.qty
            }
        })
        // add a new order to the DB
        const newOrder = await Order.create({
            userId: customer.metadata.userId,
            stripeUID: data.customer,
            paymentIntentId: data.payment_intent,
            products: order_items_array,
            subtotal: data.amount_subtotal,
            total: data.amount_total,
            shipping: data.customer_details,
            payment_status: data.payment_status
        });
        if(!newOrder){
            throw new Error("Unable to create a new order");
        }
        return true;             
    } catch(err){
        return {
            error: true,
            error_msg: err
        }
    }
}

/**
 * Function to clear of the user's cart data
 */
const clearCartData = async(cartID) => {
    try{
        // delete the cart from the cache
        await redis_cart_storage.del(`${cartID}`);
    } catch(err){
        return {
            error: true,
            error_msg: err
        }
    }
}

export {createOrder, clearCartData}
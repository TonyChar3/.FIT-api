import Cart from '../models/cartModel.js';
import { verifyCartToken } from '../middleware/utilsJWT.js';

/**
 * Functions for the cart job
 */

/**
 * Function to keep the cart collection clean of random customers cart
 *  with expired jwt
 */
const verifyExpiredCartDB = async() => {
    try{
        const carts = await Cart.find()

        if(carts){
            for (const cart of carts){
                const { _id, jwt } = cart;
                if(jwt){
                    const verified = verifyCartToken(jwt)
                    if(!verified){
                        await Cart.findByIdAndDelete(_id);
                    }
                }
            }
        }
        console.log("Expired carts all cleared")
    } catch(err){
        console.log("DB cart verifier error: ",err)
    }
}

export { verifyExpiredCartDB }
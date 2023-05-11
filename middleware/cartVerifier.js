import Cart from '../models/cartModel.js';
import { verifyCartToken } from './tokenValid.js';

/**
 * Function to keep the cart collection clean of random customers cart
 *  with expired jwt
 */
const verifyExpiredCartDB = async() => {
    try{
        const carts = await Cart.find()

        if(carts){
            for (const cart of carts){
                const { jwt: cartJwt, _id: cartID } = cart;

                const verified = verifyCartToken(cartJwt)

                if(!verified){
                    await Cart.findByIdAndDelete(cartID);
                }
            }
        }
        console.log("Expired carts all cleared")
    } catch(err){
        console.log("DB cart verifier error: ",err)
    }
}

export { verifyExpiredCartDB }
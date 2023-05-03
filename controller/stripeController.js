import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import dotenv from 'dotenv';


dotenv.config()

const stripe = Stripe(process.env.SECRET_STRIPE);

//@desc to create the payment intent to the stripe API
const createPaymentIntent = asyncHandler( async(req,res,next) => {

    try{
        
        const { items } = req.body

        const line_items = items.map((prodct) => {
           return{
            price: prodct.stripe_ID,
            quantity: prodct.qty,
           }  
        })
        
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: 'http://10.0.0.129:3000/success',
            cancel_url: 'http://10.0.0.129:3000/shop',
            automatic_tax: { enabled: true }
        });
    
        res.send({ url: session.url })

    } catch(err){
        console.log(err)
    }
});

//@desc webhook for when the checkout is done
//@route POST /stripe/webhook
//@acess PUBLIC
const paymentFulfillment = asyncHandler( async(req,res) => {
    const payload = req.body;

    console.log( payload );

    res.status(200).end();
});

export { createPaymentIntent, paymentFulfillment }
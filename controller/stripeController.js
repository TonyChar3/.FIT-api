import asyncHandler from 'express-async-handler';
import { TopologyDescription } from 'mongodb';
import stripe from 'stripe';

//@desc to create the payment intent to the stripe API
const createPaymentIntent = asyncHandler( async(req,res,next) => {

    try{
        
        const { items } = req.body

        const session = await stripe.checkout.sessions.create({
            line_items: items,
            mode: 'payment',
            success_url: 'http://localhost:3000/success?success=true',
            cancel_url: 'http://localhost:3000/error?cancel=true',
            automatic_tax: { enable: true }
        });
    
        res.redirect(303, session.url)

    } catch(err){
        console.log(err)
    }
});

export { createPaymentIntent }
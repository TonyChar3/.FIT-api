import asyncHandler from 'express-async-handler';
import stripe from 'stripe';

//@desc to create the payment intent to the stripe API
const createPaymentIntent = asyncHandler( async(req,res,next) => {
    const { items } = req.body

    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "cad",
        automatic_payment_methods: {
          enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

export { createPaymentIntent }
import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';


dotenv.config()

const stripe = Stripe(process.env.SECRET_STRIPE);

//@desc to create the payment intent to the stripe API
const createPaymentIntent = asyncHandler( async(req,res,next) => {

    try{
        
        const { items, userID } = req.body

        const hashedToken = await bcrypt.hash(userID, 10)

        console.log(hashedToken)

        const StripeCustomer = await stripe.customers.create({
            metadata:{
                userId: hashedToken.toString(),
                cart: JSON.stringify(items)
                
            }
        });

        console.log('Custromer', items)

        const line_items = items.map((prodct) => {
           return{
            price: prodct.stripe_ID,
            quantity: prodct.qty,
           }  
        })
        
        const session = await stripe.checkout.sessions.create({
            customer: StripeCustomer.id,
            line_items: line_items,
            mode: 'payment',
            success_url: 'http://10.0.0.129:3000/success',
            cancel_url: 'http://10.0.0.129:3000/shop',
            automatic_tax: { enabled: true },
            submit_type: 'auto',
            customer_update: {
                address: 'auto',
                shipping: 'auto'
            }
        });
        console.log('Session', session)
        res.send({ url: session.url })

    } catch(err){
        console.log(err)
    }
});
 
//@desc webhook for when the checkout is done
//@route POST /stripe/webhook
//@acess PUBLIC
const paymentFulfillment = asyncHandler( async(req,res,next) => {

    // const endpointSecret = process.env.STRIPE_ENDPOINT
    let endpointSecret;

    const sig = req.headers['stripe-signature'];

    let data;
    let eventType;

    

    if(endpointSecret){

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            console.log('Webhook success')
        } catch (err) {
            console.log('Webhook error')
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        data = event.data.object;
        eventType = event.type;
    } else {
        data =req.body.data;
        eventType = req.body.type
    }
  

  
    // Handle the event
    if(eventType === 'checkout.session.completed'){
        stripe.customers.retrieve(data.object.customer).then(
            (customer) => {
                console.log(customer);
                console.log("data", data)
            }
        ).catch(err => console.log(err.message))
    }
  
    // Return a 200 response to acknowledge receipt of the event
    res.send().end();
  });

export { createPaymentIntent, paymentFulfillment }
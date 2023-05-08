import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createOrder, clearCartData } from '../middleware/stripeOrder.js';


dotenv.config()

const stripe = Stripe(process.env.SECRET_STRIPE);

//@desc to create the payment intent to the stripe API
const createPaymentIntent = asyncHandler( async(req,res,next) => {

    try{
        
        const { items, userID } = req.body

        const StripeCustomer = await stripe.customers.create({
            metadata:{
                userId: userID.toString(),
                cart: JSON.stringify(items)
            }
        });

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
            },
            shipping_address_collection: {
                allowed_countries: ['US', 'CA']
            },
            shipping_options: [
                {
                  shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                      amount: 0,
                      currency: 'cad',
                    },
                    display_name: 'Free shipping',
                    delivery_estimate: {
                      minimum: {
                        unit: 'business_day',
                        value: 5,
                      },
                      maximum: {
                        unit: 'business_day',
                        value: 7,
                      },
                    },
                  },
                },
                {
                  shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                      amount: 1500,
                      currency: 'cad',
                    },
                    display_name: 'Next day air',
                    delivery_estimate: {
                      minimum: {
                        unit: 'business_day',
                        value: 1,
                      },
                      maximum: {
                        unit: 'business_day',
                        value: 1,
                      },
                    },
                  },
                },
              ],
        });
        res.send({ url: session.url })

    } catch(err){
        console.log(err)
    }
});
 
//@desc webhook for when the checkout is done
//@route POST /stripe/webhook
//@acess PUBLIC
const paymentFulfillment = asyncHandler( async(req,res,next) => {

    const endpointSecret = process.env.STRIPE_ENDPOINT
    const sig = req.headers['stripe-signature'];

    let data;
    let eventType;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
        
    } catch (err) {
        
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    data = event.data.object;
    eventType = event.type;
  
    // Handle the event
    if(eventType === 'checkout.session.completed'){
        stripe.customers.retrieve(data.customer).then(
            (customer) => {
                createOrder(customer, data)
                // clear the users cart
                clearCartData(customer.metadata.userId)
            }
        ).catch(err => console.log(err.message))
    }
  
    // Return a 200 response to acknowledge receipt of the event
    res.send().end();
  });

export { createPaymentIntent, paymentFulfillment }
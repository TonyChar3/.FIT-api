import express, { json } from 'express';
import { createPaymentIntent, paymentFulfillment } from '../controller/stripeController.js';

const router = express.Router();

router.post('/create-payment-intent', createPaymentIntent);

router.post('/webhook', json() , paymentFulfillment);

export default router;
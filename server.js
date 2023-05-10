import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import dotenv from 'dotenv';
import connectDB from './config/dbConnection.js';
import passPort from './config/passport.js';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import stripe from 'stripe';
const stripeInstance = stripe(process.env.STRIPE_KEY);

// access the .env variables
dotenv.config();

// connect the DB
connectDB();

// use the express framework
const app = express();

// set up the PORT with the variable
const port = process.env.PORT || 8080;

// use the config for the passport-jwt strategy
passPort(passport);

// initialize passport.js
app.use(passport.initialize());

// initialize stripe checkout
stripeInstance

// use json with express
app.use(express.json({
    limit: '5mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
}));

app.use(express.urlencoded({ extended: true }));

// Cross-Origin Resource Sharing
app.use(cors({
    origin: 'http://10.0.0.129:3000',
    credentials: true
}));

// to protect the headers of our request
app.use(helmet());

// routes for anonymous users
app.use('/', userRoutes);

// routes for the user 
app.use('/user', userRoutes);

// routes for the shop
app.use('/shop', productRoutes);

// routes for the wishlist
app.use('/wishlist', wishlistRoutes);

// routes for the cart
app.use('/cart', cartRoutes);

// routes for the stripe checkout ui
app.use('/stripe', stripeRoutes);

// routes for admin
app.use('/admin', adminRoutes);

// to handle the error
app.use(errorHandler);

// start up the server
app.listen(port, () => {
    console.log(`Secured server is running on port ${port}`)
});

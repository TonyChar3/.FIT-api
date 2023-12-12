import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import dotenv from 'dotenv';
import session from 'express-session';
import connectDB from './config/dbConnection.js';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import cookieParser from 'cookie-parser';
import passport_setup from './config/passport.js';
import redis from 'redis';
import RedisStore from 'connect-redis';
import stripeRoutes from './routes/stripeRoutes.js';
import stripe from 'stripe';
const stripeInstance = stripe(process.env.STRIPE_KEY);

/**
 * .FIT website API
 * ---------------------------------
 * made by: TonyChar3
 * ---------------------------------
 * tech. used: Node js w/Express.js
 * DB: MongoDB
 * Cache: Redis
 */

// access the .env variables
dotenv.config();
// connect the DB
connectDB();
// redis products instance
const redis_products_storage = redis.createClient({
    url: process.env.REDIS_URL_CONNECT,
    database: 3
});
// redis cart instance
const redis_cart_storage = redis.createClient({
    url: process.env.REDIS_URL_CONNECT,
    database: 4
})
// redis user wishlist instance
const redis_wishlist_storage = redis.createClient({
    url: process.env.REDIS_URL_CONNECT,
    database: 5
})
// redis session storage
const redis_session_store = redis.createClient({
    url: process.env.REDIS_URL_CONNECT,
    database: 6
})
// connect the session store
redis_session_store.connect().catch(err => {
    console.log('Redis session store ERROR: ', err)
});
// use the express framework
const app = express();
// set up the PORT with the variable
const port = process.env.PORT || 8080;
// initialize new session
app.use(session({
    store: new RedisStore({ client: redis_session_store, ttl: 86400 }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
// initialize passport.js
app.use(passport.initialize());
// initialize session w/ passport.js
app.use(passport.session());
// set up passport.js
passport_setup(passport);
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
app.use(cookieParser());
// Cross-Origin Resource Sharing
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
// to protect the headers of our request
app.use(helmet());

/**
 * Server Routes
 */
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

    redis_cart_storage.connect().then(() => {
        console.log('Redis cart storage client is connected');
    })
    .catch((err) => {
        console.log('Redis cart storage client ERROR: ', err)
    });

    redis_products_storage.connect().then(() => {
        console.log('Redis products client is connected');
    })
    .catch((err) => {
        console.log('Redis products client ERROR: ', err)
    });

    redis_wishlist_storage.connect().then(() => {
        console.log('Redis client wishlist is connected');
    })
    .catch((err) => {
        console.log('Redis wishlist client ERROR: ', err)
    });
});

export { redis_cart_storage, redis_products_storage, redis_wishlist_storage } 

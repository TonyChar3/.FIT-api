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

// use json with express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// to protect the headers of our request
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({
    origin: 'http://10.0.0.129:3000',
    credentials: true
}));

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

// routes for admin
app.use('/admin', adminRoutes);

// to handle the error
app.use(errorHandler);

/**
 * Secure the server with HTTPS
 */

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const sslServer = https.createServer({
//     key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
// }, app);

// start up the server
app.listen(port, () => {
    console.log(`Secured server is running on port ${port}`)
});

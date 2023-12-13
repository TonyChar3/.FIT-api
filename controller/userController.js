import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import passport from 'passport';
import { randomJWT } from '../middleware/utilsJWT.js';
import { verifyToken } from '../middleware/utilsJWT.js';

/**
 * Controllers for the authentication of the users 
 *  w/Facebook or Google + Passport Js
 */

//@desc Login the user
//@route POST /user/login
//@acess public access
const googleLoginUser = asyncHandler( async(req,res,next) => {
    try{
        passport.authenticate('google', { scope: ['profile', 'email', 'openid'] })(req,res,next);
    } catch(err){
        next(err);
    }
});

//@desc Login the user w/ Facebook
//@route GET /user/facebook-login
//@acces public
const facebookLoginUser = asyncHandler(async(req,res,next) => {
    try{
        passport.authenticate('facebook', { scope: ['public_profile','email'] })(req,res,next);
    } catch(err){
        next(err);
    }
});

//@desc Login callback
//@route GET 'user/auth-callback
//@access private access
const loginCallback = asyncHandler(async(req,res,next) => {
    try{
        res.status(200).json({ message: "User log in success!" });
    } catch(err){
        next(err);
    }
});

//@desc login success
//@route GET user/auth-success
//@access private
const googleLoginSuccess = asyncHandler(async(req,res,next) => {
    try{
        const { sub, name, email } = req.user._json
        if(!sub || !name || !email){
            res.status(401);
            return;
        }
        // check if the user was added to the persistent storage
        const user_isAdded = await User.findOne({ email: email });
        // if no -> add it then redirect
        if(!user_isAdded){
            // create a new user object and save it into the DB
            const user = await User.create({
                _id: sub,
                username: name,
                email: email,
                admin: false
            });
            if(user){
                res.redirect('http://localhost:3000/login')
            }
        // if yes -> redirect
        } else {
            res.redirect('http://localhost:3000/login')
        }
    } catch(err){
        next(err)
    }
});

//@desc login success
//@route GET user/auth-success
//@access private
const facebookLoginSuccess = asyncHandler(async(req,res,next) => {
    try{
        const { id, first_name, last_name, email } = req.user._json
        // check if the user was added to the persistent storage
        const user_isAdded = await User.findOne({ email: email });
        // if no -> add it then redirect
        if(!user_isAdded){
            const name = first_name + '' + last_name
            // create a new user object and save it into the DB
            const user = await User.create({
                _id: id,
                username: name,
                email: email,
                admin: false
            });
            if(user){
                res.redirect('http://localhost:3000/login')
            }
        // if yes -> redirect
        } else {
            res.redirect('http://localhost:3000/login')
        }
    } catch(err){
        next(err)
    }
});

//@desc login failure
//@route GET user/auth-failure
//@access private
const loginFailure = (req,res,next) => {
    res.redirect('http://localhost:3000/login');
};

//@desc Logout the user
//@route POST /user/logout
//@access private access
const logOutUser = asyncHandler(async(req,res,next) => {
    try{
        req.logOut((err) => {
            if(err){
                throw new Error(`${err}`);
            }
            res.status(200).cookie('connect.sid', '', { expires: new Date(0), httpOnly: true, path:'/' });
            res.status(200).json({ success: true, message:"User sign out"});
        });
    } catch(err){
        next(err);
    }
})

//@desc Anonymous user set up
//@route GET /fit-user
//@access public
const anonymousUser = asyncHandler( async(req,res,next) => {
    try{
        // separate the Bearer and the token parts
        const verification = await verifyToken(req.headers.cookie);
        // get the hash from the cookie header
        if(verification.error){
            //generate a random empty JWT token
            const tokenObject = randomJWT();
            // using the random JWT to create a small hash
            const hashToken = await bcrypt.hash(tokenObject.token, 10);
            // if the hash is generated
            if(hashToken){
                res.status(200).cookie('fit-customer', tokenObject.token, { expires: new Date(2030,0), maxAge: 48 * 60 * 60 * 1000, domain:'.tony-char3.com', httpOnly: true, path:'/', sameSite: 'none', secure: true })
                res.status(200).cookie('fit-hash', hashToken, { expires: new Date(2030,0), maxAge: 48 * 60 * 60 * 1000, domain:'.tony-char3.com', httpOnly: true, path:'/', sameSite: 'none', secure: true })
                res.status(200).json({ success: true });
                return
            } else {
                throw new Error("Unable to create new acces token");
            }
        }
        res.status(200).json({ success: true });
    } catch(err){
        console.log(err)
        next(err);
    }
});

//@desc The current logged in user
//@route GET /user/current
//@acess private access
const currentUser = asyncHandler( async(req,res,next) => {
    if(req.isAuthenticated() && req.user){
        res.status(200).json(req.user);
    } else {
        res.status(404).json({ message: 'New customer' });
    }
});

//@desc Clear the httpOnly cookies
//@route GET /user/clear-session
//@access public
const clearSessionCookies = asyncHandler( async(req,res,next) => {
    try{ 
        res.status(200).cookie('fit-hash', '', { expires: new Date(0), httpOnly: true, path:'/' })
        res.status(200).cookie('fit-customer', '', { expires: new Date(0), httpOnly: true, path:'/' })
        res.status(200).send({ message: "Session cleared" });
    } catch(err){
        next(err)
    }
})

export { googleLoginUser, facebookLoginUser, currentUser, anonymousUser, logOutUser, loginCallback, loginFailure, googleLoginSuccess, facebookLoginSuccess, clearSessionCookies}


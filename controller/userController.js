import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import { issueJWT } from '../middleware/utilsJWT.js';


//@desc Register a new into the DB
//@route POST /user/register
//@acess public access
const registerUser = asyncHandler( async(req,res,next) => {

    try {
        // deconstruct the username and password from the request
        const { username, email, password, admin } = req.body

        // check if the user isn't already registered
        const userisRegistered = await User.findOne({ email: email });

        if (userisRegistered){
            // send status
            res.status(400);
            // throw an error in the console
            throw new Error("User already registered")
        }

        // hash the password with bcrypt
        const hashPasswrd = await bcrypt.hash(password, 10);

        // create a new user object and save it into the DB
        const user = await User.create({
            username,
            email,
            admin,
            password: hashPasswrd,
        });

        // check if the user was successfully registered
        if(user){
            res.status(201).json({ _id: user.id, email: email})
        } else {
            res.status(400);
            throw new Error("User credentials not valid")
        }

        // respond with success message using json
        res.json({ msg: "User registered" })

    } catch(err){
        next(err)
    }

});


//@desc Login the user
//@route POST /user/login
//@acess public access
const loginUser = asyncHandler( async(req,res,next) => {

    try{
        // deconstruct the email and password
        const { email, password } = req.body

        // find the user using the email
        const user = await User.findOne({ email: email })

        // if found and if the password is valid
        if (user) {

            // validate the password
            const isValid = await bcrypt.compare(password, user.password)

            // if the password is valid
            if (!isValid){
                res.status(401);
                throw new Error("Wrong password")
            }

            // generate a token
            const tokenObject = issueJWT(user);

            // success of operation message
            res.status(200).json({ success: true, user: user, token: tokenObject.token, expire: tokenObject.expires });
        } else {
            // set the status
            res.status(401);
            // throw error in the console
            throw new Error("Wrong credentials");
        }
    } catch(err){
        next(err)
    }
});


//@desc The current logged in user
//@route GET /user/current
//@acess private access
const currentUser = asyncHandler( async(req,res,next) => {
    res.json(req.user)
});

export { registerUser, loginUser, currentUser}


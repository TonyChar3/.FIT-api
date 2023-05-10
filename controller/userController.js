import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import { authJWT, ConfirmPasswd, randomJWT } from '../middleware/utilsJWT.js';


//@desc Register a new into the DB
//@route POST /user/register
//@acess public access
const registerUser = asyncHandler( async(req,res,next) => {
    try {
        // deconstruct the username and password from the request
        const { username, email, password, admin } = req.body
        // check if the user isn't already registered
        const userisRegistered = await User.findOne({ email: email });

        // if the user is already registered
        if (userisRegistered){
            res.status(400);
            throw new Error("User already registered");
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
            res.status(201).json({ _id: user.id, email: email, message: "You are now registered!"});
        } else {
            res.status(400);
            throw new Error("User credentials not valid");
        }
        // respond with success message using json
        res.json({ message: "User registered" });
    } catch(err){
        next(err);
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
        const user = await User.findOne({ email: email });
        // if found and if the password is valid
        if (user) {
            // validate the password
            const isValid = await bcrypt.compare(password, user.password);
            // if the password is valid
            if (!isValid){
                res.status(401);
                throw new Error("Wrong password");
            }
            // generate a token
            const tokenObject = authJWT(user);
            // success of operation message
            res.status(200).json({ success: true, message:"Welcome back!", user: user, token: tokenObject.token, expire: tokenObject.expires });
        } else {
            res.status(401);
            throw new Error("Wrong credentials");
        }
    } catch(err){
        next(err);
    }
});

//@desc Anonymous user set up
//@route GET /fit-user
//@access public
const anonymousUser = asyncHandler( async(req,res,next) => {
    //generate a random empty JWT token
    const tokenObject = randomJWT();
    // using the random JWT to create a small hash
    const hashToken = await bcrypt.hash(tokenObject.token, 10);

    // if the hash is generated
    if(hashToken){
        res.status(200).json({ success: true, token: tokenObject.token, hashToken: hashToken, expire: tokenObject.expires });
    } else {
        res.status(500);
        throw new Error("Unable to create new acces token");
    }
});

//@desc The current logged in user
//@route GET /user/current
//@acess private access
const currentUser = asyncHandler( async(req,res,next) => {
    res.json(req.user);
});

//@desc Update the user's profile
//@route PUT /user/update
//@access private
const updateUser = asyncHandler( async(req,res,next) => {
    try{
        // deconstruct the values from the request.body
        const { u_id ,u_name, u_email, u_password, u_confirmPasswd } = req.body;
        // find the user with his email
        const user = await User.findOne({ _id: u_id });
        // To gather every updates sent back
        const updateProfile = {};

        // make sure it is found
        if(!user){
            res.status(500);
            throw new Error("Error, unable to find user to update");
        }

        // Make sure the new Password and Confirm password are the same
        const confirmed = ConfirmPasswd(u_password, u_confirmPasswd);
        if(!confirmed) {
            res.status(400).json("Please be sure to send back the same password");
        }

        if(u_name){ 
            // if a username is sent back
            if(user.username !== u_name){
                // set it in the updateprofile object
                updateProfile.username = u_name;
            }
        } else if(u_email){
            // if a new email is sent back
            if(user.email !== u_email){
                // set it int the updateprofile object
                updateProfile.email = u_email;
            }
        } else if(u_password){
            // verify if the password is the same or not
            const verify = await bcrypt.compare(u_password, user.password);
            // If its not the same as the old one
            if(!verify){
                // hash the new password with bcrypt
                const hashPassword = await bcrypt.hash(u_password, 10);
                // set it in the profileupdate object
                updateProfile.password = hashPassword;
            }
        }
        // if the updateprofile object is empty
        if(Object.keys(updateProfile).length === 0){
            res.status(200).json({ message: "Nothing to update"});
        } else {
            // update what was updated
            const update = await User.findByIdAndUpdate(
                {_id: u_id},
                {
                    $set: updateProfile
                },
                {new:true}
            );
            if(update){
                res.status(201).json({ message: "Profile Updated" });
            } else {
                res.status(500);
                throw new Error("Unable to update the profile using the info provided");
            }
        }
    } catch(err){
        next(err)
    }
});

export { registerUser, loginUser, currentUser, updateUser, anonymousUser}


import { verifyToken } from '../middleware/utilsJWT.js';

/**
 * Authentication + Identity verification middleware
 */

/**
 * Verify the cookies and JWT
 */
const cookiesIdentityVerification = async(req,res) => {
    try{
        if(req.isAuthenticated() && req.user){
            return req.user.id;
        } else {
            // separate the Bearer and the token parts
            const verification = await verifyToken(req.headers.cookie);
            if(verification.error){
                throw new Error();
            }
            // get the hash from the cookie header
            const fit_customer_hash = req.headers.cookie.split('; ').find((cookie) => cookie.startsWith('fit-hash='));
            return fit_customer_hash.split('=')[1];
        }
    } catch(err){
        res.status(401).send({ message: 'Invalid identity.'});
    }
}

/**
 * Verify authencation token
 */
const AuthVerification = (req,res,next) => {
    console.log("Verification: ", req.isAuthenticated());
    if(req.isAuthenticated()){
        next()
    } else {
        res.status(401).send({ message: "Unauthorized" });
    }
}

/**
 * Verify if the auth user is an admin
 */
const isAdmin = (req,res,next) => {
    if(req.user.admin){
        next();
    }else{
        res.status(401);
        throw new Error("You are unauthorized to view this");
    }
}

export { cookiesIdentityVerification, AuthVerification, isAdmin }
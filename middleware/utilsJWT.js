import jsonwebtoken from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToPrivKey = path.join(__dirname, '../', 'id_rsa_priv.pem');

const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');
const RANDOM_PUB_KEY = fs.readFileSync(pathToPrivKey, 'utf8');

/**
 * Verification + JWT issuer middleware
 */

/**
 * Function to issue a random JWT token
 */
const randomJWT = () => {
    const payload = {
        sub: "customer",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
    }
    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { algorithm: 'RS256' });
    return{
        token: signedToken,
        expires: payload.exp
    }
}

/**
 * Verify the JWT token
 */
const verifyToken = async(token) => {
    try{
        const fit_customer_cookie = token.split('; ').find((cookie) => cookie.startsWith('fit-customer='))
        jsonwebtoken.verify(fit_customer_cookie.split('=')[1], PRIV_KEY);
        return true
    } catch(err){
        return {
            error: true,
            error_msg: err
        }
    }
}

/**
 * Verify the cart JWT token
 */
const verifyCartToken = (token) => {
    if(token.match(/\S+\.\S+\.\S+/) !== null) {
        try{
            const options = {
                algorithm: 'RS256'
            }
            // verify using jsonwebtoken
            const verif = jsonwebtoken.verify(token, RANDOM_PUB_KEY, options);
            if(verif){
                return true
            } 

        } catch(err){
            if (err instanceof jsonwebtoken.JsonWebTokenError || err instanceof jsonwebtoken.NotBeforeError){
                return false
            } else {
                next(err)
            }
        }
    } else {
        console.log("invalid token in the cart DB")
    }
}

export { randomJWT, verifyToken, verifyCartToken };
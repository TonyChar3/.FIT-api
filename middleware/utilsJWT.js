import jsonwebtoken from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToPrivKey = path.join(__dirname, '../', 'id_rsa_priv.pem');
const pathToLogInKey = path.join(__dirname, '../', 'log_in_priv.pem');

const LOG_IN_KEY = fs.readFileSync(pathToLogInKey, 'utf8');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');

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
        token: "Bearer " + signedToken,
        expires: payload.exp
    }
}

/**
 * Function to issue a fresh JWT Token
 */

const authJWT = (user) => {

    const _id = user.id;
    
    const payload = {
        sub: _id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };

    const signedToken = jsonwebtoken.sign(payload, LOG_IN_KEY, { algorithm: 'RS256' });

    return{
        token: "Bearer " + signedToken,
        expires: payload.exp
    }
}

/**
 * Function to confirm the updated password
 */
const ConfirmPasswd = (p_pass1, p_pass2) => {

    // compare the two password to see if they are the same
    if(p_pass1.toString() === p_pass2.toString()){

        return true

    } else {
        
        return false
    }
    
}

export { authJWT, ConfirmPasswd, randomJWT };
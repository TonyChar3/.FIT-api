import jsonwebtoken from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToPrivKey = path.join(__dirname, '../', 'id_rsa_priv.pem');

const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');


/**
 * Function to issue a fresh JWT Token
 */

const issueJWT = (user) => {

    const _id = user.id;
    
    const expiresIn = '1d';

    const payload = {
        sub: _id,
        iat: Date.now()
    };

    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });

    return{
        token: "Bearer " + signedToken,
        expires: expiresIn
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

export { issueJWT, ConfirmPasswd };
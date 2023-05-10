import jsonwebtoken from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToPrivKey = path.join(__dirname, '../', 'id_rsa_pub.pem');
const pathToLogInKey = path.join(__dirname, '../', 'log_in_pub.pem');

const LOG_IN_KEY = fs.readFileSync(pathToLogInKey, 'utf8');
const RANDOM_PUB_KEY = fs.readFileSync(pathToPrivKey, 'utf8');

const verfiyToken = (req,res,next) => {
    // separate the Bearer and the token parts
    const tokenParts = req.headers.authorization.split(" ")
    if(tokenParts[0] === 'Bearer' && tokenParts[1].match(/\S+\.\S+\.\S+/) !== null) {
        try{
            const options = {
                algorithm: 'RS256'
            }
            // verify using jsonwebtoken
            const verif = jsonwebtoken.verify(tokenParts[1], RANDOM_PUB_KEY, options);
            if(!verif){
                res.status(400);
                throw new Error("Token not valid")
            } else {
                req.jwt = verif;
                next();
            }
        } catch(err){
            // if the logged in user jwt token doesnt verify
            if (err instanceof jsonwebtoken.JsonWebTokenError || err instanceof jsonwebtoken.NotBeforeError){
                try{
                    const options = {
                        algorithm: 'RS256'
                    }
                    const loginVerif = jsonwebtoken.verify(tokenParts[1], LOG_IN_KEY, options)
                    if(!loginVerif){
                        res.status(400);
                        throw new Error("Token not valid, Unauthorized to login")
                    } else {
                        req.jwt = loginVerif;
                        next();
                    }
                } catch(err){
                    if (err instanceof jsonwebtoken.JsonWebTokenError || err instanceof jsonwebtoken.NotBeforeError){
                        res.status(400);
                        throw new Error(`${err}`)
                    } else {
                        next(err)
                    }
                }
            } else {
                next(err)
            }
        }
    } else {
        res.status(401);
        throw new Error("Please have valid token")
    }
}

export { verfiyToken }
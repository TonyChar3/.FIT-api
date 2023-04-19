import fs from 'fs';
import path from 'path';
import passportJwt from 'passport-jwt';
const JwtStrategy = passportJwt.Strategy;
import { ExtractJwt } from 'passport-jwt';
import { fileURLToPath } from 'url';
import User from '../models/userModel.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');


const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
};

const strategy = new JwtStrategy(options, async(payload, done) => {

    try{
        // find the user with the _id
        const user = await User.findOne({ _id: payload.sub })

        // verify if the user was found or not
        if(user){

            // if found return the user
            return done(null,user);

        } else {

            // if not found return false
            return done(null, false);

        }
    } catch(err){
        done(err, null)
    }
});

const passPort = (passport) => {
    passport.use(strategy)
}

export default passPort;
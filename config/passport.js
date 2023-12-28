import dotenv from 'dotenv';
import passportGoogle from 'passport-google-oauth20';
const GoogleStrategy = passportGoogle.Strategy;
import passportFacebook from 'passport-facebook';
const FacebookStrategy = passportFacebook.Strategy;

dotenv.config();

/**
 * Google login w/ Passport
 */
const google_strategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3001/user/google-auth-callback',
    scope: ['profile', 'email']
},function(accessToken, refreshToken, profile, done){
    // const user_profile = profile
    return done(null, profile);
})

/**
 * Facebook login w/ Passport
 */
const facebook_strategy = new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: 'http://localhost:3001/user/facebook-auth-callback',
    profileFields: ['id', 'email', 'name']
},function(accessToken, refreshToken, profile, done){
    // const user_profile = profile
    return done(null, profile);
})

/**
 * Set up Passport js
 */
const passport_setup = (passport) => {

    passport.use(google_strategy);
    passport.use(facebook_strategy);

    passport.serializeUser((user, cb) => {
        cb(null, user);
    });

    passport.deserializeUser((obj, cb) => {
        cb(null, obj);
    });
}

export default passport_setup;
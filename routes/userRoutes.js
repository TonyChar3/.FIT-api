import express from "express";
import passport from 'passport';
import { googleLoginUser, currentUser, anonymousUser, logOutUser, loginCallback,loginFailure, googleLoginSuccess, facebookLoginSuccess, clearSessionCookies, facebookLoginUser} from '../controller/userController.js';
import { AuthVerification } from "../middleware/utilsAuth.js";

const router = express.Router();

router.get('/google-login', googleLoginUser);

router.get('/facebook-login', facebookLoginUser);

router.get('/google-auth-callback', passport.authenticate('google', { successRedirect:'/user/google-auth-success', failureRedirect: '/user/auth-failure' }), loginCallback);

router.get('/facebook-auth-callback', passport.authenticate('facebook', { successRedirect:'/user/facebook-auth-success', failureRedirect: '/user/auth-failure' }), loginCallback);

router.get('/google-auth-success', googleLoginSuccess);

router.get('/facebook-auth-success', facebookLoginSuccess);

router.get('/auth-failure', loginFailure);

router.post('/logout', AuthVerification, logOutUser);

router.get('/fit-user', anonymousUser);

router.get('/current', AuthVerification, currentUser);

router.get('/clear-session', clearSessionCookies);

export default router;
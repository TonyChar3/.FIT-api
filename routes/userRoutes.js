import express from "express";
import passport from 'passport';
import { registerUser, loginUser, currentUser} from '../controller/userController.js';
const router = express.Router();

router.get('/current', passport.authenticate('jwt', { session: false }), currentUser);

router.route('/login').post(loginUser);

router.route('/register').post(registerUser);

export default router;
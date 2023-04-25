import express from "express";
import passport from 'passport';
import { registerUser, loginUser, currentUser, updateUser} from '../controller/userController.js';
const router = express.Router();


router.route('/login').post(loginUser);

router.route('/register').post(registerUser);

router.get('/current', passport.authenticate('jwt', { session: false }), currentUser);

router.put('/update', passport.authenticate('jwt', { session: false }), updateUser);

export default router;
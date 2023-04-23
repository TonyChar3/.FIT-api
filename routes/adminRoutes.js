import express from 'express';
import passport from 'passport';
import { isAdmin } from '../middleware/adminHandler.js';
import { addNewProdct, addNewImg, removeProdct } from '../controller/adminController.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }))

router.post('/addProdct', isAdmin, addNewProdct);

router.post('/addProdctImg', isAdmin, addNewImg);

router.delete('/removProdct', isAdmin, removeProdct);


export default router;
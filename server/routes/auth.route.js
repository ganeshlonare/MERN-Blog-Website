import express from 'express'
import { google, logout, signIn, signUp } from '../controllers/auth.controller.js';
import upload from '../middlewares/multerMiddleware.js';

const router=express.Router();

router.post("/signup" , upload.single('avatar') , signUp)
router.post("/signin" , signIn)
router.post("/google" , google);
router.post("/logout" , logout);

export default router;
import express from 'express'
import { changePassword, google, logout, signIn, signUp } from '../controllers/auth.controller.js';
import upload from '../middlewares/multerMiddleware.js';
import { verifyToken } from '../utils/verifyJWT.js';

const router=express.Router();

router.post("/signup" , upload.single('avatar') , signUp)
router.post("/signin" , signIn)
router.post("/google" , google);
router.post("/logout" , logout);
router.post("/change-password" ,verifyToken, changePassword);

export default router;
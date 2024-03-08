import express from 'express'
import { verifyToken } from '../utils/verifyJWT.js';
import { createBlog } from '../controllers/user.controller.js';

const router=express.Router();

router.post("/create-blog" , verifyToken , createBlog)

export default router;
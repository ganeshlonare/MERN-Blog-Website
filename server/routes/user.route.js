import express from 'express'
import { verifyToken } from '../utils/verifyJWT.js';
import { createBlog, searchUser } from '../controllers/user.controller.js';

const router=express.Router();

router.post("/create-blog" , verifyToken , createBlog)
router.post("/search-users",searchUser)

export default router;
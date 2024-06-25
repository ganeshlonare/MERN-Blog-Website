import express from 'express'
import { verifyToken } from '../utils/verifyJWT.js';
import { createBlog, getBlog, getProfile, searchUser } from '../controllers/user.controller.js';

const router=express.Router();

router.post("/get-profile" ,verifyToken, getProfile)
router.post("/create-blog" ,verifyToken, createBlog)
router.post("/search-users",searchUser)
router.post("/get-blog",getBlog)

export default router;
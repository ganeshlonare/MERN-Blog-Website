import express from 'express'
import { verifyToken } from '../middlewares/verifyJWT.js';
import { createBlog, deleteBlog, getBlog, getUserBlogs, getUserBlogsCount, updateBlog } from '../controllers/userBlog.controller.js';

const router=express.Router();

router.post("/create-blog" ,verifyToken, createBlog)
router.post("/get-blog",getBlog)
router.post("/edit-blog", verifyToken , updateBlog)
router.post("/get-user-blogs" ,verifyToken, getUserBlogs);
router.post("/get-user-blogs-count" ,verifyToken, getUserBlogsCount);
router.post("/delete-blog" ,verifyToken, deleteBlog);

export default router;
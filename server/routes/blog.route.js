import express from 'express'
import {isLikedByUser, latestBlogs, likeBlog, searchBlogs, trendingBlogs } from '../controllers/blog.controller.js'
import { verifyToken } from '../middlewares/verifyJWT.js';

const router = express.Router();

router.get('/latest-blogs',latestBlogs);
router.get('/trending-blogs',trendingBlogs);
router.post('/search-blogs',searchBlogs);
router.post('/like-blog',verifyToken,likeBlog);
router.post('/is-liked-by-user',verifyToken,isLikedByUser);

export default router;
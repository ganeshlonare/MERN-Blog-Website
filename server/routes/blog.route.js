import express from 'express'
import {  addComment, getBlogComments, getReplies, isLikedByUser, latestBlogs, likeBlog, searchBlogs, trendingBlogs } from '../controllers/blog.controller.js'
import { verifyToken } from '../utils/verifyJWT.js';

const router = express.Router();

router.get('/latest-blogs',latestBlogs);
router.get('/trending-blogs',trendingBlogs);
router.post('/search-blogs',searchBlogs);
router.post('/like-blog',verifyToken,likeBlog);
router.post('/is-liked-by-user',verifyToken,isLikedByUser);
router.post('/add-comment',verifyToken,addComment);
router.post('/get-blog-comments',getBlogComments);
router.post('/get-blog-comments-replies',getReplies);

export default router;
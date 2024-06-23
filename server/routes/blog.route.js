import express from 'express'
import { latestBlogs, searchBlogs, trendingBlogs } from '../controllers/blog.controller.js'

const router = express.Router();

router.get('/latest-blogs',latestBlogs);
router.get('/trending-blogs',trendingBlogs);
router.post('/search-blogs',searchBlogs);

export default router;
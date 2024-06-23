import express from 'express'
import { latestBlogs, trendingBlogs } from '../controllers/blog.controller.js'

const router = express.Router();

router.get('/latest-blogs',latestBlogs);
router.get('/trending-blogs',trendingBlogs);

export default router;
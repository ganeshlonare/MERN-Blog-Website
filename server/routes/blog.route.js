import express from 'express'
import { latestBlogs } from '../controllers/blog.controller.js'

const router = express.Router();

router.get('/latest-blogs',latestBlogs);

export default router;
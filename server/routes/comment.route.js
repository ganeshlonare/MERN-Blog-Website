import { Router } from "express";
import { addComment, deleteComment, getBlogComments, getReplies } from "../controllers/comment.controller.js";
import { verifyToken } from "../middlewares/verifyJWT.js";

const router=Router()

router.post('/add-comment',verifyToken,addComment);
router.post('/get-blog-comments',getBlogComments);
router.post('/get-blog-comments-replies',getReplies);
router.post('/delete-comment',verifyToken,deleteComment);

export default router
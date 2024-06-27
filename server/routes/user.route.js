import express from 'express'
import { verifyToken } from '../utils/verifyJWT.js';
import { changePassword, createBlog, getBlog, newNotifications, getProfile, searchUser, updateBlog, updateProfileImage, updateUser, notifications, notificationsCount, getUserBlogs, getUserBlogsCount, deleteBlog } from '../controllers/user.controller.js';
import upload from '../middlewares/multerMiddleware.js';

const router=express.Router();

router.post("/get-profile" ,verifyToken, getProfile)
router.post("/create-blog" ,verifyToken, createBlog)
router.post("/search-users",searchUser)
router.post("/get-blog",getBlog)
router.post("/edit-blog", verifyToken , updateBlog)
router.post("/update-user" ,verifyToken, updateUser);
router.post("/update-profile-image" ,verifyToken, upload.single('avatar') , updateProfileImage);
router.post("/change-password" ,verifyToken, changePassword);
router.post("/new-notifications" ,verifyToken, newNotifications);
router.post("/notifications" ,verifyToken, notifications);
router.post("/notifications-count" ,verifyToken, notificationsCount);
router.post("/get-user-blogs" ,verifyToken, getUserBlogs);
router.post("/get-user-blogs-count" ,verifyToken, getUserBlogsCount);
router.post("/delete-blog" ,verifyToken, deleteBlog);

export default router;
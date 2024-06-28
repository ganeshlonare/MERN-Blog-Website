import express from 'express'
import { verifyToken } from '../middlewares/verifyJWT.js';
import { changePassword, getProfile, searchUser, updateProfileImage, updateUser } from '../controllers/user.controller.js';
import upload from '../middlewares/multerMiddleware.js';

const router=express.Router();

router.post("/get-profile" ,verifyToken, getProfile)
router.post("/search-users",searchUser)
router.post("/update-user" ,verifyToken, updateUser);
router.post("/update-profile-image" ,verifyToken, upload.single('avatar') , updateProfileImage);
router.post("/change-password" ,verifyToken, changePassword);

export default router;
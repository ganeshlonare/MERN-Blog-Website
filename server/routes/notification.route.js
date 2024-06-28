import { Router } from "express";
import { verifyToken } from "../middlewares/verifyJWT.js";
import { newNotifications, notifications, notificationsCount } from "../controllers/notification.controller.js";

const router=Router()

router.post("/new-notifications" ,verifyToken, newNotifications);
router.post("/notifications" ,verifyToken, notifications);
router.post("/notifications-count" ,verifyToken, notificationsCount);

export default router
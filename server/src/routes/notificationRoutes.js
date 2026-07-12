import { Router } from "express";
import { listNotifications, markRead, streamNotifications } from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, listNotifications);
router.get("/stream", streamNotifications);
router.patch("/:id/read", protect, markRead);

export default router;

import { Router } from "express";
import { listActivity } from "../controllers/activityController.js";
import { protect } from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { Roles } from "../utils/constants.js";

const router = Router();

router.get("/", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), listActivity);

export default router;

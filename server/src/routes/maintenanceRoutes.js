import { Router } from "express";
import { listMaintenance, raiseMaintenance, updateMaintenanceStatus } from "../controllers/maintenanceController.js";
import { protect } from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { Roles } from "../utils/constants.js";

const router = Router();

router.get("/", protect, listMaintenance);
router.post("/", protect, raiseMaintenance);
router.patch("/:id/status", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), updateMaintenanceStatus);

export default router;

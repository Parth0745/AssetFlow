import { Router } from "express";
import { closeAudit, createAudit, listAudits, verifyAssetInAudit } from "../controllers/auditController.js";
import { protect } from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { Roles } from "../utils/constants.js";

const router = Router();

router.get("/", protect, listAudits);
router.post("/", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), createAudit);
router.post("/:id/verify", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER, Roles.DEPARTMENT_HEAD), verifyAssetInAudit);
router.post("/:id/close", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), closeAudit);

export default router;

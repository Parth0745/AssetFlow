import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { Roles } from "../utils/constants.js";
import {
  assetTimeline,
  bulkStatusChange,
  createAsset,
  deleteAssetsBulk,
  getAssetByQr,
  listAssets,
  updateAsset
} from "../controllers/assetController.js";

const router = Router();

router.get("/", protect, listAssets);
router.get("/qr", protect, getAssetByQr);
router.get("/:id/timeline", protect, assetTimeline);
router.post("/", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), createAsset);
router.put("/:id", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), updateAsset);
router.post("/bulk-delete", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), deleteAssetsBulk);
router.post("/bulk-status", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), bulkStatusChange);

export default router;

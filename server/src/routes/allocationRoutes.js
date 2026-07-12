import { Router } from "express";
import {
  createAllocation,
  createTransferRequest,
  listTransferRequests,
  listAllocations,
  returnAllocation,
  updateTransferStatus
} from "../controllers/allocationController.js";
import { protect } from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { Roles } from "../utils/constants.js";

const router = Router();

router.get("/", protect, listAllocations);
router.get("/transfer-requests", protect, listTransferRequests);
router.post("/", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), createAllocation);
router.post("/:id/return", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER, Roles.DEPARTMENT_HEAD), returnAllocation);
router.post("/transfer-requests", protect, createTransferRequest);
router.patch("/transfer-requests/:id/status", protect, allow(Roles.ADMIN, Roles.DEPARTMENT_HEAD), updateTransferStatus);

export default router;

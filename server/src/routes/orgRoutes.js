import { Router } from "express";
import {
  assignRole,
  createCategory,
  createDepartment,
  createEmployee,
  deactivateEmployee,
  deleteCategory,
  deleteDepartment,
  getOrgSetup,
  updateCategory,
  updateDepartment,
  updateEmployee
} from "../controllers/orgController.js";
import { protect } from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { Roles } from "../utils/constants.js";

const router = Router();

router.get("/", protect, getOrgSetup);
router.post("/departments", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), createDepartment);
router.put("/departments/:id", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), updateDepartment);
router.delete("/departments/:id", protect, allow(Roles.ADMIN), deleteDepartment);

router.post("/categories", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), createCategory);
router.put("/categories/:id", protect, allow(Roles.ADMIN, Roles.ASSET_MANAGER), updateCategory);
router.delete("/categories/:id", protect, allow(Roles.ADMIN), deleteCategory);

router.post("/employees", protect, allow(Roles.ADMIN), createEmployee);
router.put("/employees/:id", protect, allow(Roles.ADMIN), updateEmployee);
router.patch("/employees/:id/deactivate", protect, allow(Roles.ADMIN), deactivateEmployee);
router.patch("/employees/:id/role", protect, allow(Roles.ADMIN), assignRole);

export default router;

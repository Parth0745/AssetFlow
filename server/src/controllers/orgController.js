import User from "../models/User.js";
import Department from "../models/Department.js";
import AssetCategory from "../models/AssetCategory.js";
import { Roles } from "../utils/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activity.js";

export const getOrgSetup = asyncHandler(async (req, res) => {
  const [departments, categories, employees] = await Promise.all([
    Department.find().populate("parentDepartment departmentHead", "name firstName lastName"),
    AssetCategory.find(),
    User.find().populate("department", "name code")
  ]);
  res.json({ departments, categories, employees });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  await logActivity({ userId: req.user._id, entity: "Department", entityId: department._id, action: "Create", newValue: department });
  res.status(201).json(department);
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const before = await Department.findById(req.params.id).lean();
  const updated = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await logActivity({ userId: req.user._id, entity: "Department", entityId: req.params.id, action: "Update", oldValue: before, newValue: updated });
  res.json(updated);
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  await logActivity({ userId: req.user._id, entity: "Department", entityId: req.params.id, action: "Delete" });
  res.json({ message: "Department deleted" });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.create(req.body);
  await logActivity({ userId: req.user._id, entity: "AssetCategory", entityId: category._id, action: "Create", newValue: category });
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const before = await AssetCategory.findById(req.params.id).lean();
  const updated = await AssetCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await logActivity({ userId: req.user._id, entity: "AssetCategory", entityId: req.params.id, action: "Update", oldValue: before, newValue: updated });
  res.json(updated);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await AssetCategory.findByIdAndDelete(req.params.id);
  await logActivity({ userId: req.user._id, entity: "AssetCategory", entityId: req.params.id, action: "Delete" });
  res.json({ message: "Category deleted" });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await User.create({ ...req.body, role: Roles.EMPLOYEE });
  await logActivity({ userId: req.user._id, entity: "User", entityId: employee._id, action: "Create", newValue: employee });
  res.status(201).json(employee);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const before = await User.findById(req.params.id).lean();
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await logActivity({ userId: req.user._id, entity: "User", entityId: req.params.id, action: "Update", oldValue: before, newValue: updated });
  res.json(updated);
});

export const deactivateEmployee = asyncHandler(async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  await logActivity({ userId: req.user._id, entity: "User", entityId: req.params.id, action: "Deactivate", newValue: { isActive: false } });
  res.json(updated);
});

export const assignRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!Object.values(Roles).includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const before = await User.findById(req.params.id).lean();
  const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  await logActivity({ userId: req.user._id, entity: "User", entityId: req.params.id, action: "RoleAssigned", oldValue: before?.role, newValue: role });
  res.json(updated);
});

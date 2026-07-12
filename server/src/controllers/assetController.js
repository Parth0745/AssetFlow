import { z } from "zod";
import Asset from "../models/Asset.js";
import Allocation from "../models/Allocation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activity.js";

const createAssetSchema = z.object({
  name: z.string().min(2),
  serialNumber: z.string().min(2),
  category: z.string(),
  department: z.string(),
  condition: z.string(),
  status: z.string(),
  purchaseDate: z.string(),
  warrantyUntil: z.string().optional().nullable(),
  acquisitionCost: z.number().nonnegative(),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
  documentUrls: z.array(z.string()).optional(),
  isBookable: z.boolean().optional(),
  customFieldValues: z.record(z.string()).optional()
});

export const listAssets = asyncHandler(async (req, res) => {
  const { q = "", status, category, department, page = 1, limit = 10 } = req.query;
  const filter = {
    name: { $regex: q, $options: "i" }
  };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (department) filter.department = department;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Asset.find(filter)
      .populate("category department", "name code")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Asset.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

export const getAssetByQr = asyncHandler(async (req, res) => {
  const { tag } = req.query;
  const asset = await Asset.findOne({ assetTag: tag }).populate("category department", "name code");
  if (!asset) return res.status(404).json({ message: "Asset not found" });
  res.json(asset);
});

export const createAsset = asyncHandler(async (req, res) => {
  const payload = createAssetSchema.parse(req.body);
  const asset = await Asset.create({
    ...payload,
    purchaseDate: new Date(payload.purchaseDate),
    warrantyUntil: payload.warrantyUntil ? new Date(payload.warrantyUntil) : null,
    history: [
      {
        event: "Registered",
        status: payload.status,
        note: "Asset registered",
        actor: req.user._id
      }
    ]
  });
  await logActivity({ userId: req.user._id, entity: "Asset", entityId: asset._id, action: "Create", newValue: asset });
  res.status(201).json(asset);
});

export const updateAsset = asyncHandler(async (req, res) => {
  const before = await Asset.findById(req.params.id).lean();
  const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await logActivity({ userId: req.user._id, entity: "Asset", entityId: req.params.id, action: "Update", oldValue: before, newValue: updated });
  res.json(updated);
});

export const deleteAssetsBulk = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  await Asset.deleteMany({ _id: { $in: ids } });
  await logActivity({ userId: req.user._id, entity: "Asset", entityId: "bulk", action: "BulkDelete", newValue: { ids } });
  res.json({ message: "Assets deleted" });
});

export const bulkStatusChange = asyncHandler(async (req, res) => {
  const { ids, status } = req.body;
  await Asset.updateMany({ _id: { $in: ids } }, { $set: { status }, $push: { history: { event: "BulkStatusChange", status, note: "Bulk update", actor: req.user._id } } });
  await logActivity({ userId: req.user._id, entity: "Asset", entityId: "bulk", action: "BulkStatusChange", newValue: { ids, status } });
  res.json({ message: "Bulk status updated" });
});

export const assetTimeline = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id).populate("history.actor", "firstName lastName");
  const allocations = await Allocation.find({ asset: req.params.id }).populate("employee", "firstName lastName");
  res.json({ history: asset?.history || [], allocations });
});

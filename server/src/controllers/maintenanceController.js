import MaintenanceRequest from "../models/MaintenanceRequest.js";
import Asset from "../models/Asset.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AssetStatus, MaintenanceStatus } from "../utils/constants.js";
import { logActivity } from "../utils/activity.js";

export const listMaintenance = asyncHandler(async (req, res) => {
  const items = await MaintenanceRequest.find()
    .populate("asset raisedBy technician", "name assetTag firstName lastName")
    .sort({ createdAt: -1 });
  res.json(items);
});

export const raiseMaintenance = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.create({
    ...req.body,
    raisedBy: req.user._id,
    timeline: [{ status: MaintenanceStatus.PENDING, note: "Request raised", actor: req.user._id }]
  });
  await logActivity({ userId: req.user._id, entity: "MaintenanceRequest", entityId: request._id, action: "Create", newValue: request });
  res.status(201).json(request);
});

export const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const { status, note, technician } = req.body;
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Maintenance request not found" });

  request.status = status;
  if (technician) request.technician = technician;
  request.timeline.push({ status, note: note || `Moved to ${status}`, actor: req.user._id, at: new Date() });
  await request.save();

  if ([MaintenanceStatus.APPROVED, MaintenanceStatus.TECHNICIAN_ASSIGNED, MaintenanceStatus.IN_PROGRESS].includes(status)) {
    await Asset.findByIdAndUpdate(request.asset, {
      status: AssetStatus.UNDER_MAINTENANCE,
      $push: { history: { event: "Maintenance", status: AssetStatus.UNDER_MAINTENANCE, note: `Maintenance ${status}`, actor: req.user._id } }
    });
  }

  if (status === MaintenanceStatus.RESOLVED) {
    await Asset.findByIdAndUpdate(request.asset, {
      status: AssetStatus.AVAILABLE,
      $push: { history: { event: "MaintenanceResolved", status: AssetStatus.AVAILABLE, note: "Maintenance resolved", actor: req.user._id } }
    });
  }

  if (status === MaintenanceStatus.REJECTED) {
    await Asset.findByIdAndUpdate(request.asset, {
      $push: { history: { event: "MaintenanceRejected", status: AssetStatus.AVAILABLE, note: "Maintenance rejected", actor: req.user._id } }
    });
  }

  await logActivity({ userId: req.user._id, entity: "MaintenanceRequest", entityId: request._id, action: "StatusChange", newValue: { status } });
  res.json(request);
});

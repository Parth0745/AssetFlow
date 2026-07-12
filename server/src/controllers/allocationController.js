import Allocation from "../models/Allocation.js";
import Asset from "../models/Asset.js";
import TransferRequest from "../models/TransferRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AssetStatus, TransferStatus } from "../utils/constants.js";
import { logActivity } from "../utils/activity.js";
import { notifyUser } from "../utils/notify.js";

export const listAllocations = asyncHandler(async (req, res) => {
  const items = await Allocation.find()
    .populate("asset employee department", "name assetTag firstName lastName")
    .sort({ createdAt: -1 });
  res.json(items);
});

export const listTransferRequests = asyncHandler(async (req, res) => {
  const items = await TransferRequest.find()
    .populate("asset fromEmployee toEmployee requestedBy approvedBy", "name assetTag firstName lastName")
    .sort({ createdAt: -1 });
  res.json(items);
});

export const createAllocation = asyncHandler(async (req, res) => {
  const { asset, employee, department, expectedReturnDate } = req.body;

  const conflict = await Allocation.findOne({ asset, status: "Active" }).populate("employee", "firstName lastName");
  if (conflict) {
    return res.status(409).json({
      message: `Already allocated to ${conflict.employee.firstName} ${conflict.employee.lastName}`,
      showTransferRequest: true,
      allocationId: conflict._id
    });
  }

  const allocation = await Allocation.create({
    asset,
    employee,
    department,
    expectedReturnDate,
    history: [{ event: "Allocated", note: "Allocation created", actor: req.user._id }]
  });

  await Asset.findByIdAndUpdate(asset, {
    status: AssetStatus.ALLOCATED,
    $push: { history: { event: "Allocated", status: AssetStatus.ALLOCATED, note: "Asset allocated", actor: req.user._id } }
  });

  await notifyUser({ userId: employee, title: "Asset Allocated", message: "You have received a new asset", type: "success" });
  await logActivity({ userId: req.user._id, entity: "Allocation", entityId: allocation._id, action: "Create", newValue: allocation });
  res.status(201).json(allocation);
});

export const returnAllocation = asyncHandler(async (req, res) => {
  const { conditionNotes } = req.body;
  const allocation = await Allocation.findById(req.params.id);
  if (!allocation) return res.status(404).json({ message: "Allocation not found" });

  allocation.status = "Returned";
  allocation.actualReturnDate = new Date();
  allocation.returnConditionNotes = conditionNotes || "";
  allocation.history.push({ event: "Returned", note: conditionNotes || "Returned", actor: req.user._id, at: new Date() });
  await allocation.save();

  await Asset.findByIdAndUpdate(allocation.asset, {
    status: AssetStatus.AVAILABLE,
    $push: { history: { event: "Returned", status: AssetStatus.AVAILABLE, note: "Asset returned", actor: req.user._id } }
  });

  await logActivity({ userId: req.user._id, entity: "Allocation", entityId: allocation._id, action: "Return", newValue: allocation });
  res.json(allocation);
});

export const createTransferRequest = asyncHandler(async (req, res) => {
  const transfer = await TransferRequest.create({
    ...req.body,
    requestedBy: req.user._id,
    status: TransferStatus.REQUESTED,
    history: [{ status: TransferStatus.REQUESTED, note: "Transfer requested", actor: req.user._id }]
  });
  await logActivity({ userId: req.user._id, entity: "TransferRequest", entityId: transfer._id, action: "Create", newValue: transfer });
  res.status(201).json(transfer);
});

export const updateTransferStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const transfer = await TransferRequest.findById(req.params.id);
  if (!transfer) return res.status(404).json({ message: "Transfer request not found" });

  transfer.status = status;
  transfer.history.push({ status, note: `Status changed to ${status}`, actor: req.user._id, at: new Date() });
  if (status === TransferStatus.APPROVED || status === TransferStatus.COMPLETED) {
    transfer.approvedBy = req.user._id;
  }
  await transfer.save();

  if (status === TransferStatus.COMPLETED) {
    const active = await Allocation.findOne({ asset: transfer.asset, status: "Active" });
    if (active) {
      active.employee = transfer.toEmployee;
      active.history.push({ event: "Transferred", note: "Allocation moved", actor: req.user._id, at: new Date() });
      await active.save();
    }
  }

  await logActivity({ userId: req.user._id, entity: "TransferRequest", entityId: transfer._id, action: "UpdateStatus", newValue: { status } });
  res.json(transfer);
});

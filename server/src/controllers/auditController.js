import AuditCycle from "../models/AuditCycle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activity.js";

export const listAudits = asyncHandler(async (req, res) => {
  const items = await AuditCycle.find().populate("auditors departmentScope results.asset", "firstName lastName name assetTag");
  res.json(items);
});

export const createAudit = asyncHandler(async (req, res) => {
  const audit = await AuditCycle.create(req.body);
  await logActivity({ userId: req.user._id, entity: "AuditCycle", entityId: audit._id, action: "Create", newValue: audit });
  res.status(201).json(audit);
});

export const verifyAssetInAudit = asyncHandler(async (req, res) => {
  const { asset, result, notes } = req.body;
  const audit = await AuditCycle.findById(req.params.id);
  if (!audit) return res.status(404).json({ message: "Audit not found" });
  if (audit.status === "Closed") return res.status(400).json({ message: "Audit is locked after closure" });

  audit.results.push({ asset, result, notes, verifiedBy: req.user._id, verifiedAt: new Date() });
  await audit.save();

  await logActivity({ userId: req.user._id, entity: "AuditCycle", entityId: audit._id, action: "VerifyAsset", newValue: { asset, result } });
  res.json(audit);
});

export const closeAudit = asyncHandler(async (req, res) => {
  const audit = await AuditCycle.findById(req.params.id);
  if (!audit) return res.status(404).json({ message: "Audit not found" });
  if (audit.status === "Closed") return res.status(400).json({ message: "Audit already closed" });

  const missing = audit.results.filter((r) => r.result === "Missing").length;
  const damaged = audit.results.filter((r) => r.result === "Damaged").length;
  audit.status = "Closed";
  audit.closedBy = req.user._id;
  audit.closedAt = new Date();
  audit.discrepancySummary = `Missing: ${missing}, Damaged: ${damaged}`;
  await audit.save();

  await logActivity({ userId: req.user._id, entity: "AuditCycle", entityId: audit._id, action: "Close", newValue: { discrepancy: audit.discrepancySummary } });
  res.json(audit);
});

import mongoose from "mongoose";

const auditResultSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    result: { type: String, enum: ["Verified", "Missing", "Damaged"], required: true },
    notes: { type: String, default: "" },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    verifiedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const auditCycleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    departmentScope: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
    locationScope: [{ type: String }],
    auditors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
    results: [auditResultSchema],
    discrepancySummary: { type: String, default: "" },
    closedAt: { type: Date, default: null },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

const AuditCycle = mongoose.model("AuditCycle", auditCycleSchema);
export default AuditCycle;

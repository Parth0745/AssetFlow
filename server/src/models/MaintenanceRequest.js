import mongoose from "mongoose";
import { MaintenanceStatus } from "../utils/constants.js";

const maintenanceRequestSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    issue: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: Object.values(MaintenanceStatus), default: MaintenanceStatus.PENDING, index: true },
    timeline: [
      {
        status: String,
        note: String,
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const MaintenanceRequest = mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
export default MaintenanceRequest;

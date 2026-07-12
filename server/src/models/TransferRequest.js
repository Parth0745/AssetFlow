import mongoose from "mongoose";
import { TransferStatus } from "../utils/constants.js";

const transferRequestSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    fromEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: Object.values(TransferStatus), default: TransferStatus.REQUESTED },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    history: [
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

const TransferRequest = mongoose.model("TransferRequest", transferRequestSchema);
export default TransferRequest;

import mongoose from "mongoose";
import { AssetStatus } from "../utils/constants.js";
import { buildQrPayload, generateAssetTag } from "../utils/assetTag.js";

const historySchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    status: { type: String, required: true },
    note: { type: String, default: "" },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    assetTag: { type: String, unique: true, index: true },
    serialNumber: { type: String, required: true, unique: true, trim: true },
    qrPayload: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "AssetCategory", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    condition: { type: String, enum: ["New", "Good", "Fair", "Poor", "Damaged"], default: "Good" },
    status: { type: String, enum: Object.values(AssetStatus), default: AssetStatus.AVAILABLE, index: true },
    purchaseDate: { type: Date, required: true },
    warrantyUntil: { type: Date, default: null },
    acquisitionCost: { type: Number, required: true, min: 0 },
    location: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    documentUrls: [{ type: String }],
    isBookable: { type: Boolean, default: false },
    customFieldValues: { type: Map, of: String },
    history: [historySchema]
  },
  { timestamps: true }
);

assetSchema.pre("save", async function autoMeta(next) {
  if (!this.assetTag) {
    const category = await mongoose.model("AssetCategory").findById(this.category).lean();
    this.assetTag = generateAssetTag(category?.code || "AST");
  }
  this.qrPayload = buildQrPayload(this);
  return next();
});

const Asset = mongoose.model("Asset", assetSchema);
export default Asset;

import mongoose from "mongoose";

const dynamicFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["text", "number", "date", "select", "boolean"], default: "text" },
    required: { type: Boolean, default: false },
    options: [{ type: String }]
  },
  { _id: false }
);

const assetCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    dynamicFields: [dynamicFieldSchema],
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
  },
  { timestamps: true }
);

const AssetCategory = mongoose.model("AssetCategory", assetCategorySchema);
export default AssetCategory;

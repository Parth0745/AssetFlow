import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    departmentHead: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);
export default Department;

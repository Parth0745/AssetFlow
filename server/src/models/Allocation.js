import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    expectedReturnDate: { type: Date, required: true },
    actualReturnDate: { type: Date, default: null },
    returnConditionNotes: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Returned", "Overdue"], default: "Active", index: true },
    history: [
      {
        event: String,
        note: String,
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

allocationSchema.index({ asset: 1, status: 1 });

const Allocation = mongoose.model("Allocation", allocationSchema);
export default Allocation;

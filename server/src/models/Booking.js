import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    resourceType: { type: String, enum: ["Room", "Vehicle", "Equipment"], required: true },
    resourceName: { type: String, required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true, index: true },
    status: { type: String, enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"], default: "Upcoming" },
    reminderAt: { type: Date, default: null }
  },
  { timestamps: true }
);

bookingSchema.index({ resourceType: 1, resourceName: 1, start: 1, end: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;

import Asset from "../models/Asset.js";
import Booking from "../models/Booking.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getReports = asyncHandler(async (req, res) => {
  const [utilization, maintenanceCost, departmentSummary, bookingHeatmap, mostUsed, leastUsed, retirement, warranty] = await Promise.all([
    Asset.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    MaintenanceRequest.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
    Asset.aggregate([{ $lookup: { from: "departments", localField: "department", foreignField: "_id", as: "dept" } }, { $unwind: "$dept" }, { $group: { _id: "$dept.name", count: { $sum: 1 } } }]),
    Booking.aggregate([{ $group: { _id: { day: { $dayOfWeek: "$start" }, hour: { $hour: "$start" } }, count: { $sum: 1 } } }]),
    Booking.aggregate([{ $group: { _id: "$resourceName", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    Booking.aggregate([{ $group: { _id: "$resourceName", count: { $sum: 1 } } }, { $sort: { count: 1 } }, { $limit: 5 }]),
    Asset.find({ status: "Retired" }).limit(20),
    Asset.find({ warrantyUntil: { $lte: new Date(new Date().setMonth(new Date().getMonth() + 2)) } }).limit(20)
  ]);

  res.json({ utilization, maintenanceCost, departmentSummary, bookingHeatmap, mostUsed, leastUsed, retirement, warranty });
});

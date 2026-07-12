import Asset from "../models/Asset.js";
import Allocation from "../models/Allocation.js";
import Booking from "../models/Booking.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import Notification from "../models/Notification.js";
import ActivityLog from "../models/ActivityLog.js";

import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    availableAssets,
    allocatedAssets,
    reservedAssets,
    maintenanceAssets,
    lostAssets,
    disposedAssets,
    pendingTransfers,
    todaysMaintenance,
    todaysBookings,
    recentActivities,
    recentNotifications,
    assetCategoryAgg,
    departmentDist,
    maintenanceTrend
  ] = await Promise.all([
    Asset.countDocuments({ status: "Available" }),
    Asset.countDocuments({ status: "Allocated" }),
    Asset.countDocuments({ status: "Reserved" }),
    Asset.countDocuments({ status: "Under Maintenance" }),
    Asset.countDocuments({ status: "Lost" }),
    Asset.countDocuments({ status: "Disposed" }),
    Allocation.countDocuments({ status: "Active" }),
    MaintenanceRequest.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    Booking.countDocuments({ start: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    ActivityLog.find().sort({ timestamp: -1 }).limit(8).populate("user", "firstName lastName"),
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8),
    Asset.aggregate([{ $lookup: { from: "assetcategories", localField: "category", foreignField: "_id", as: "cat" } }, { $unwind: "$cat" }, { $group: { _id: "$cat.name", value: { $sum: 1 } } }]),
    Asset.aggregate([{ $lookup: { from: "departments", localField: "department", foreignField: "_id", as: "dept" } }, { $unwind: "$dept" }, { $group: { _id: "$dept.name", value: { $sum: 1 } } }]),
    MaintenanceRequest.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }])
  ]);

  res.json({
    kpis: {
      availableAssets,
      allocatedAssets,
      reservedAssets,
      maintenanceAssets,
      lostAssets,
      disposedAssets,
      pendingTransfers,
      todaysMaintenance,
      todaysBookings
    },
    widgets: {
      recentActivities,
      recentNotifications,
      assetCategoryAgg,
      departmentDist,
      maintenanceTrend
    }
  });
});

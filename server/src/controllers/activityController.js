import ActivityLog from "../models/ActivityLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listActivity = asyncHandler(async (req, res) => {
  const items = await ActivityLog.find()
    .populate("user", "firstName lastName email role")
    .sort({ timestamp: -1 })
    .limit(500);
  res.json(items);
});

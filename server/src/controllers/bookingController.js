import Booking from "../models/Booking.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../utils/activity.js";

export const listBookings = asyncHandler(async (req, res) => {
  const items = await Booking.find().populate("bookedBy department", "firstName lastName name").sort({ start: 1 });
  res.json(items);
});

export const createBooking = asyncHandler(async (req, res) => {
  const { resourceType, resourceName, start, end } = req.body;
  const overlap = await Booking.findOne({
    resourceType,
    resourceName,
    status: { $ne: "Cancelled" },
    $and: [{ start: { $lt: new Date(end) } }, { end: { $gt: new Date(start) } }]
  });

  if (overlap) {
    return res.status(409).json({ message: "Overlapping booking exists for selected resource and time range" });
  }

  const booking = await Booking.create({
    ...req.body,
    bookedBy: req.user._id
  });
  await logActivity({ userId: req.user._id, entity: "Booking", entityId: booking._id, action: "Create", newValue: booking });
  res.status(201).json(booking);
});

export const updateBooking = asyncHandler(async (req, res) => {
  const before = await Booking.findById(req.params.id).lean();
  const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await logActivity({ userId: req.user._id, entity: "Booking", entityId: req.params.id, action: "Update", oldValue: before, newValue: updated });
  res.json(updated);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const updated = await Booking.findByIdAndUpdate(req.params.id, { status: "Cancelled" }, { new: true });
  await logActivity({ userId: req.user._id, entity: "Booking", entityId: req.params.id, action: "Cancel", newValue: { status: "Cancelled" } });
  res.json(updated);
});

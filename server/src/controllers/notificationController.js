import Notification from "../models/Notification.js";
import { notificationHub } from "../utils/notificationHub.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const streamNotifications = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.write(`data: ${JSON.stringify({ event: "connected" })}\n\n`);
  const unsubscribe = notificationHub.subscribe(res);
  req.on("close", () => unsubscribe());
};

export const listNotifications = asyncHandler(async (req, res) => {
  const { unread } = req.query;
  const filter = { user: req.user._id };
  if (unread === "true") filter.isRead = false;
  const items = await Notification.find(filter).sort({ createdAt: -1 });
  res.json(items);
});

export const markRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ message: "Notification marked as read" });
});

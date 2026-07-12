import Notification from "../models/Notification.js";
import { notificationHub } from "./notificationHub.js";

export async function notifyUser({ userId, title, message, type = "info" }) {
  const notification = await Notification.create({ user: userId, title, message, type });
  notificationHub.broadcast({
    id: notification._id,
    userId: String(userId),
    title,
    message,
    type,
    createdAt: notification.createdAt
  });
  return notification;
}

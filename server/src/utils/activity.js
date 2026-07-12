import ActivityLog from "../models/ActivityLog.js";

export async function logActivity({ userId, entity, entityId, action, oldValue = null, newValue = null }) {
  if (!userId) return;
  await ActivityLog.create({
    user: userId,
    entity,
    entityId: String(entityId),
    action,
    oldValue,
    newValue
  });
}

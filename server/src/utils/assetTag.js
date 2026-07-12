import { nanoid } from "nanoid";

export function generateAssetTag(categoryCode = "AST") {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = nanoid(5).toUpperCase();
  return `${categoryCode}-${stamp}-${suffix}`;
}

export function buildQrPayload(asset) {
  return JSON.stringify({
    id: asset._id,
    tag: asset.assetTag,
    serial: asset.serialNumber,
    status: asset.status,
    name: asset.name
  });
}

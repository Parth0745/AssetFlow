import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assetflow",
  jwtSecret: process.env.JWT_SECRET || "unsafe-dev-secret",
  jwtExpires: process.env.JWT_EXPIRES || "7d",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:5173"
};

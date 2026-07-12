import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import User from "./models/User.js";
import Department from "./models/Department.js";
import AssetCategory from "./models/AssetCategory.js";
import Asset from "./models/Asset.js";
import Allocation from "./models/Allocation.js";
import Booking from "./models/Booking.js";
import MaintenanceRequest from "./models/MaintenanceRequest.js";
import AuditCycle from "./models/AuditCycle.js";
import Notification from "./models/Notification.js";
import ActivityLog from "./models/ActivityLog.js";
import { AssetStatus, Roles } from "./utils/constants.js";

async function clearAll() {
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    AssetCategory.deleteMany({}),
    Asset.deleteMany({}),
    Allocation.deleteMany({}),
    Booking.deleteMany({}),
    MaintenanceRequest.deleteMany({}),
    AuditCycle.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({})
  ]);
}

async function seed() {
  await connectDb();
  await clearAll();

  const [it, hr, ops] = await Department.create([
    { name: "Information Technology", code: "IT" },
    { name: "Human Resources", code: "HR" },
    { name: "Operations", code: "OPS" }
  ]);

  const [laptops, vehicles, rooms] = await AssetCategory.create([
    { name: "Laptop", code: "LTP", description: "Portable computers", dynamicFields: [{ key: "ram", label: "RAM", type: "text" }] },
    { name: "Vehicle", code: "VEH", description: "Company vehicles" },
    { name: "Conference Room", code: "ROM", description: "Meeting spaces" }
  ]);

  const users = await User.create([
    { firstName: "Aarav", lastName: "Admin", email: "admin@assetflow.com", password: "Admin@123", role: Roles.ADMIN, department: it._id },
    { firstName: "Maya", lastName: "Manager", email: "manager@assetflow.com", password: "Manager@123", role: Roles.ASSET_MANAGER, department: it._id },
    { firstName: "Priya", lastName: "Head", email: "head@assetflow.com", password: "Head@123", role: Roles.DEPARTMENT_HEAD, department: hr._id },
    { firstName: "Rohan", lastName: "Employee", email: "employee@assetflow.com", password: "Employee@123", role: Roles.EMPLOYEE, department: ops._id }
  ]);

  const [admin, manager, head, employee] = users;

  await Department.findByIdAndUpdate(hr._id, { departmentHead: head._id });

  const assets = await Asset.create([
    {
      name: "Dell Latitude 7440",
      serialNumber: "DL-7440-001",
      category: laptops._id,
      department: it._id,
      condition: "Good",
      status: AssetStatus.AVAILABLE,
      purchaseDate: new Date("2025-01-15"),
      warrantyUntil: new Date("2028-01-15"),
      acquisitionCost: 1450,
      location: "HQ - Floor 4",
      isBookable: false,
      history: [{ event: "Registered", status: AssetStatus.AVAILABLE, note: "Seed data", actor: admin._id }]
    },
    {
      name: "Toyota Innova Fleet 03",
      serialNumber: "INNOVA-03",
      category: vehicles._id,
      department: ops._id,
      condition: "Fair",
      status: AssetStatus.ALLOCATED,
      purchaseDate: new Date("2024-08-10"),
      warrantyUntil: new Date("2027-08-10"),
      acquisitionCost: 31000,
      location: "Warehouse A",
      isBookable: true,
      history: [{ event: "Registered", status: AssetStatus.ALLOCATED, note: "Seed data", actor: admin._id }]
    },
    {
      name: "Board Room Orion",
      serialNumber: "ROOM-ORION-1",
      category: rooms._id,
      department: hr._id,
      condition: "Good",
      status: AssetStatus.RESERVED,
      purchaseDate: new Date("2024-01-01"),
      acquisitionCost: 0,
      location: "HQ - Floor 2",
      isBookable: true,
      history: [{ event: "Registered", status: AssetStatus.RESERVED, note: "Seed data", actor: admin._id }]
    }
  ]);

  await Allocation.create({
    asset: assets[1]._id,
    employee: employee._id,
    department: ops._id,
    expectedReturnDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    status: "Active",
    history: [{ event: "Allocated", note: "Seed allocation", actor: manager._id }]
  });

  await Booking.create([
    {
      title: "Weekly Ops Sync",
      resourceType: "Room",
      resourceName: "Board Room Orion",
      bookedBy: head._id,
      department: hr._id,
      start: new Date(new Date().setHours(11, 0, 0, 0)),
      end: new Date(new Date().setHours(12, 0, 0, 0)),
      status: "Upcoming"
    },
    {
      title: "Airport Pickup",
      resourceType: "Vehicle",
      resourceName: "Toyota Innova Fleet 03",
      bookedBy: employee._id,
      department: ops._id,
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setDate(new Date().getDate() + 1) + 1000 * 60 * 60),
      status: "Upcoming"
    }
  ]);

  await MaintenanceRequest.create({
    asset: assets[0]._id,
    raisedBy: employee._id,
    priority: "High",
    issue: "Keyboard keys are intermittently failing",
    status: "Pending",
    timeline: [{ status: "Pending", note: "Seed issue", actor: employee._id }]
  });

  await AuditCycle.create({
    name: "Q3 Physical Verification",
    departmentScope: [it._id, ops._id],
    locationScope: ["HQ", "Warehouse A"],
    auditors: [manager._id, head._id],
    status: "Open"
  });

  await Notification.create([
    { user: employee._id, title: "Asset Allocation", message: "Vehicle assigned to you", type: "success" },
    { user: manager._id, title: "Maintenance Approval Needed", message: "One maintenance request pending", type: "warning" }
  ]);

  await ActivityLog.create({
    user: admin._id,
    entity: "System",
    entityId: "seed",
    action: "SeedDataGenerated",
    newValue: { assets: assets.length, users: users.length }
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete");
  await mongoose.connection.close();
}

seed();

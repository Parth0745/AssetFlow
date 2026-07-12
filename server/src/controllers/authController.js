import { z } from "zod";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../middleware/auth.js";
import { Roles } from "../utils/constants.js";
import { logActivity } from "../utils/activity.js";

const signupSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const signup = asyncHandler(async (req, res) => {
  const payload = signupSchema.parse(req.body);
  const exists = await User.findOne({ email: payload.email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email already exists" });

  const user = await User.create({ ...payload, role: Roles.EMPLOYEE });
  const token = signToken(user);

  await logActivity({
    userId: user._id,
    entity: "User",
    entityId: user._id,
    action: "Signup",
    newValue: { email: user.email, role: user.role }
  });

  return res.status(201).json({
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !user.isActive || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user);
  return res.json({
    token,
    rememberMe: Boolean(rememberMe),
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department
    }
  });
});

export const me = asyncHandler(async (req, res) => {
  return res.json(req.user);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    return res.json({ message: "If account exists, reset instructions were sent" });
  }
  return res.json({ message: "Reset flow placeholder ready for SMTP integration" });
});

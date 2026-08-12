import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { generateToken } from "../utils/generateToken.js";
import { sendWelcomeEmail } from "./email.service.js";
import {ROLES} from "../constants/roles.js"; // Ensure this is imported

export const registerUser = async ({ fullName, email, password, phone, role }) => {
  if (!fullName || !email || !password) {
    const error = new Error("Full name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error("User already exists with this email");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

 const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    phone: phone || "",
    role: role || ROLES.USER
  });

  // Background task: Don't 'await' here if you want fast responses
  sendWelcomeEmail({
    toEmail: user.email,
    fullName: user.fullName
  }).catch(err => console.error("Non-blocking email failure:", err.message))

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified
    },
    token
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified
    },
    token
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const updateUserAvatar = async (userId, avatarPath) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarPath },
    { new: true, runValidators: true }
  ).select("-password"); // Exclude password from the returned object

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
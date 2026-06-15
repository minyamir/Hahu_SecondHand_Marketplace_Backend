import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },// Adding this helps Admin dashboards filter users quickly
    verificationStatus: {
        type: String,
        enum: ['unverified', 'pending', 'verified', 'flagged', 'rejected'],
        default: 'unverified'
    },
    isVerified: {
        type: Boolean,
        default: false
      },
    avatar: {
      type: String,
      default: ""
    },
    // --- Password Reset Fields ---
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
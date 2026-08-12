import * as authService from "../services/auth.service.js";
import User from "../models/User.model.js"; // 👈 Add this import!
export const register = async (req, res, next) => {
  try {
    // Explicitly destructure, including role
    const { fullName, email, password, phone, role } = req.body;

    // Pass the fields explicitly
    const result = await authService.registerUser({ 
      fullName, 
      email, 
      password, 
      phone, 
      role 
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No avatar uploaded" });
    }

    // 🔑 Point to the subfolder where the file actually lives (/uploads/misc/)
    const avatarUrl = `/uploads/misc/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id || req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error); // Passes errors cleanly to errorMiddleware
  }
};
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserLocation,
  updateUserProfile,
  changePassword,
  verifySecurityQuestion,
  resetPassword,
  listAllNGOs
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/ngos", listAllNGOs);

router.post("/verify-security", verifySecurityQuestion);

router.post("/reset-password", resetPassword);

router.get("/me", authMiddleware, getCurrentUser);

router.put("/update-location", authMiddleware, updateUserLocation);

router.put("/update-profile", authMiddleware, updateUserProfile);

router.put("/change-password", authMiddleware, changePassword);

export default router;
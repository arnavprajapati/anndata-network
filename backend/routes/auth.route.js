import express from "express";
import { 
    registerUser, 
    loginUser, 
    listAllNGOs, 
    forgotPassword, 
    verifySecurityAnswer, 
    resetPassword 
} from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/register", registerUser);
router.get("/ngos",listAllNGOs);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-security-answer", verifySecurityAnswer);
router.post("/reset-password", resetPassword);

export default router;


import express from "express";
import { login, resetPassword, forgotPassword, validateResetToken } from "../controllers/auth.js";


const router = express.Router();

// Login route
router.post("/login", login);

// Forgot password route
router.post("/forgotPassword", forgotPassword);

// Validate reset token route
router.get('/reset-password/:token', validateResetToken);

// Reset password route
router.post("/reset-password/:token", resetPassword);

export default router;

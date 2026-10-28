const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyOtp, forgotPassword, resetPassword } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/email");

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const getEmailDomain = (email = "") => {
  const [, domain = ""] = email.split("@");
  return domain.trim().toLowerCase();
};
const isGmailAddress = (email) => getEmailDomain(email) === "gmail.com";

const isBlockedTestDomain = (email) => {
  const domain = getEmailDomain(email);
  return /(^|\.)example\.com(\.com)?$/.test(domain);
};

const isValidEmail = (email) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;

  const domain = getEmailDomain(email);
  return !domain.endsWith(".com.com");
};


const generateToken = (id,role) => {
    return jwt.sign({ id,role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}



// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!isValidEmail(email) || isBlockedTestDomain(email)) {
      return res.status(400).json({ error: "Please enter a real email address." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.create({ email, otp, action: "account_verification" });
    await sendOTPEmail(email, otp, "account_verification");

    res.status(201).json({
      message: "User registered successfully. Please check your email for the verification OTP.",
      email: newUser.email
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// LOgin user
exports.loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!isValidEmail(email) || isBlockedTestDomain(email)) {
      return res.status(400).json({ error: "Please enter a real email address." });
    }

    if (!isGmailAddress(email)) {
      return res.status(400).json({ error: "Please sign in with your @gmail.com address." });
    }

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
      return res.status(400).json({ error: "Invalid credential, please signup first" });
    }
  const isMatch = await bcrypt.compare(password, existingUser.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if(!existingUser.isVerified && existingUser.role === "user") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email, action: "account_verification" });
    await OTP.create({ email, otp, action: "account_verification" });
    await sendOTPEmail(email, otp, "account_verification");
    return res.status(400).json({
      error: "Account not verified. A verification OTP has been sent to your email.",
      needsVerification: true
    });
  }  
  res.json({
    message: "Login successful",
    _id: existingUser._id,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role,
    token: generateToken(existingUser._id, existingUser.role)
  });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// verify OTP

exports.verifyOtp = async (req, res) => {
    try {
    const { otp } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!isValidEmail(email) || isBlockedTestDomain(email)) {
      return res.status(400).json({ error: "Please enter a real email address." });
    }

    const otpRecord = await OTP.findOne({ email, otp, action: "account_verification" });
    if (!otpRecord) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
    }   
  
    const verifiedUser = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );
    await OTP.deleteMany({ email, action: "account_verification" });
    res.json({ 
        message: "Account verified successfully. You can now log in.",
        _id: verifiedUser._id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        role: verifiedUser.role,
        token: generateToken(verifiedUser._id, verifiedUser.role)
     });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!isValidEmail(email) || isBlockedTestDomain(email)) {
      return res.status(400).json({ error: "Please enter a real email address." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No account found with that email address." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email, action: "password_reset" });
    await OTP.create({ email, otp, action: "password_reset" });
    await sendOTPEmail(email, otp, "password_reset");

    res.json({ message: "Password reset OTP has been sent to your email." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp, password } = req.body;

    if (!isValidEmail(email) || isBlockedTestDomain(email)) {
      return res.status(400).json({ error: "Please enter a real email address." });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const otpRecord = await OTP.findOne({ email, otp, action: "password_reset" });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    await OTP.deleteMany({ email, action: "password_reset" });

    res.json({ message: "Password reset successfully. Please log in with your new password." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

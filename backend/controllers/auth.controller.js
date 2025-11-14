import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";


// -----------------------------
// CREATE JWT ACCESS TOKEN
// -----------------------------
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
};


// -----------------------------
// REGISTER ANY USER (Donor or NGO)
// -----------------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, securityQuestion, securityAnswer } = req.body;

    // basic validation
    if (!name || !email || !password || !role || !securityQuestion || !securityAnswer)
      return res.status(400).json({ message: "Name, email, password, role, security question and answer are required" });
    if (!["donor", "ngo"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    // check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "Email already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      securityQuestion,
      securityAnswer,
    });
    console.log(user);
    
    // create token
    const token = generateToken(user);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------
// LOGIN USER
// -----------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // create token
    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------
// LIST ALL NGOs
// -----------------------------
export const listAllNGOs = async (req, res) => {
  try {
    const ngos = await User.find({ role: "ngo" }).select("-password"); // hide password

    return res.status(200).json({
      count: ngos.length,
      ngos,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};




// -----------------------------
// FORGOT PASSWORD - STEP 1 (Get Security Question)
// -----------------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Security question retrieved",
      securityQuestion: user.securityQuestion,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// VERIFY SECURITY ANSWER - STEP 2
// -----------------------------
export const verifySecurityAnswer = async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;

    if (!email || !securityAnswer)
      return res.status(400).json({ message: "Email and answer required" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Compare answer (case-insensitive)
    if (user.securityAnswer.trim().toLowerCase() !== securityAnswer.trim().toLowerCase()) {
      return res.status(401).json({ message: "Incorrect security answer" });
    }

    return res.status(200).json({
      message: "Security answer verified",
      email: user.email,     // pass back email for password reset
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------
// RESET PASSWORD - STEP 3
// -----------------------------
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ message: "Email and new password required" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

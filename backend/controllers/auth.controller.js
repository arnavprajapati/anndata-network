import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};



export const registerUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      securityQuestion, 
      securityAnswer,
      location 
    } = req.body;

    if (!name || !email || !password || !role || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ 
        message: "All fields are required",
        required: ["name", "email", "password", "role", "securityQuestion", "securityAnswer"]
      });
    }

    if (!["donor", "ngo"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'donor' or 'ngo'" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      securityQuestion: securityQuestion.trim(),
      securityAnswer: hashedSecurityAnswer,
      location: location || { lat: null, lng: null, text: "" }
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location
      },
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" }); 
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User data fetched successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Get Current User Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const updateUserLocation = async (req, res) => {
  try {
    const { lat, lng, text } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: {
          lat,
          lng,
          text: text || ""
        }
      },
      { new: true }
    ).select("-password -securityAnswer");

    return res.json({
      message: "Location updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Update Location Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true }
    ).select("-password -securityAnswer");

    return res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.json({
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const verifySecurityQuestion = async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;

    if (!email || !securityAnswer) {
      return res.status(400).json({ message: "Email and security answer are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      securityAnswer.toLowerCase().trim(), 
      user.securityAnswer
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect security answer" });
    }

    const resetToken = jwt.sign(
      { id: user._id, purpose: "reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({
      message: "Security answer verified",
      resetToken,
      securityQuestion: user.securityQuestion
    });

  } catch (error) {
    console.error("Verify Security Question Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Reset token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.purpose !== "reset") {
        return res.status(401).json({ message: "Invalid reset token" });
      }
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(decoded.id, {
      password: hashedPassword
    });

    return res.json({
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const listAllNGOs = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    let ngos = await User.find({ role: "ngo" })
      .select("-password -securityAnswer -securityQuestion")
      .sort({ createdAt: -1 });

    if (lat && lng && radius) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      ngos = ngos.filter(ngo => {
        if (!ngo.location?.lat || !ngo.location?.lng) return false;
        
        const R = 6371;
        const dLat = (ngo.location.lat - userLat) * Math.PI / 180;
        const dLng = (ngo.location.lng - userLng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(userLat * Math.PI / 180) * Math.cos(ngo.location.lat * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        ngo._doc.distance = Math.round(distance * 10) / 10;
        return distance <= maxRadius;
      });

      ngos.sort((a, b) => (a._doc.distance || 0) - (b._doc.distance || 0));
    }

    return res.status(200).json({
      count: ngos.length,
      ngos,
    });

  } catch (error) {
    console.error("List NGOs Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
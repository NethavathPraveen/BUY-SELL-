import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateOTP, sendOtpEmail } from "../utils/sendOtp.js";

// Register User & Send OTP
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with OTP but not verified
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            isVerified: false, // Not verified yet
        });

        await newUser.save();

        // Send OTP to email
        const emailResponse = await sendOtpEmail(email, otp);
        if (!emailResponse.success) {
            return res.status(500).json({ message: "Error sending OTP" });
        }

        res.status(200).json({ message: "OTP sent to your email. Verify to complete registration." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("\n🔵 Login Attempt:", { email, password });

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User Not Found");
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔍 Password Match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        // Ensure JWT secret exists
        if (!process.env.JWT_SECRET) {
            console.error("🚨 JWT_SECRET is missing in environment variables!");
            return res.status(500).json({ success: false, message: "Server misconfiguration" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        console.log("✅ Token Generated:", token);

        // Send Response
        res.status(200).json({ 
            success: true,
            message: "Login successful",
            token, 
            userId: user._id 
        });

    } catch (error) {
        console.error("🔥 Server Error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Mark user as verified and remove OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully. Account activated!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

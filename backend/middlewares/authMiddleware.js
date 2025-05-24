import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
    let token;
    //console.log("Authorization Header:", req.headers.authorization); // ✅ Debugging
    console.log("JWT_SECRET from .env:", process.env.JWT_SECRET); // ✅ Debugging
    console.log("Authorization Header:", req.headers.authorization); // ✅ Debugging

    // Check if Authorization header contains a token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        console.log("Extracted Token:", token); // ✅ Debugging
    }

    // If no token, return 401 (Unauthorized)
    if (!token) {
        console.log("No token provided!"); // ✅ Debugging
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // ✅ Debugging

        // Fetch user details (excluding password)
        req.user = await User.findById(decoded.userId).select("-password");

        if (!req.user) {
            console.log("User not found in database!"); // ✅ Debugging
            return res.status(401).json({ message: "User not found" });
        }

        console.log("Authenticated User:", req.user); // ✅ Debugging

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error); // ✅ Debugging
        return res.status(401).json({ message: "Invalid token" });
    }
};

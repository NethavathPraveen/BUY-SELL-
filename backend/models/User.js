import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isVerified: { type: Boolean, default: false }, // Email verification status
        otp: { type: String }, // Stores OTP
        otpExpires: { type: Date }, // OTP expiration time
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

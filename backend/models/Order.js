import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        quantity: { type: Number, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        otp: { type: String },
        otpExpires: { type: Date },
        status: { 
            type: String, 
            enum: ["Pending", "Awaiting OTP", "Confirmed", "Cancelled"], 
            default: "Pending" 
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;

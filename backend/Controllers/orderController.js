import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { sendEmail } from "../utils/sendEmail.js"; // Function to send OTP emails
import crypto from "crypto"; // To generate OTP

// **Place an Order**
export const placeOrder = async (req, res) => {
    const { buyerId, productId } = req.body;

    try {
        console.log("\n🔹 Place Order API called");
        console.log("🔸 Buyer ID:", buyerId);
        console.log("🔸 Product ID:", productId);

        // Fetch product details
        const product = await Product.findById(productId);
        if (!product) {
            console.log("❌ Product not found!");
            return res.status(404).json({ message: "Product not found" });
        }
        console.log("✅ Product found:", product);

        const sellerId = product.sellerId;
        console.log("🔸 Seller ID from Product:", sellerId);

        // Fetch seller details
        const seller = await User.findById(sellerId);
        if (!seller) {
            console.log("❌ Seller not found!");
            return res.status(404).json({ message: "Seller not found" });
        }
        console.log("✅ Seller found:", seller);

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 mins

        console.log("🔹 Generated OTP:", otp);
        console.log("🔹 OTP Expiry Time:", otpExpires);

        // Create order
        const order = new Order({
            buyerId,
            sellerId,
            productId,
            otp,
            otpExpires,
            status: "Awaiting OTP",
        });

        await order.save();
        console.log("✅ Order placed successfully:", order);

        // Send OTP email to seller
        console.log("📧 Sending OTP to Seller:", seller.email);
        await sendEmail(seller.email, "Order Confirmation OTP", `Your OTP is ${otp}`);
        console.log("✅ OTP email sent to seller.");

        res.status(201).json({ message: "Order placed. OTP sent to seller.", orderId: order._id });
    } catch (error) {
        console.error("❌ Error placing order:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// **Send OTP to Buyer**
export const sendOtpToBuyer = async (req, res) => {
    const { orderId } = req.body;

    try {
        console.log("\n🔹 Send OTP to Buyer API called");
        console.log("🔸 Order ID:", orderId);

        // Fetch order details
        const order = await Order.findById(orderId).populate("buyerId");

        if (!order) {
            console.log("❌ Order not found!");
            return res.status(404).json({ message: "Order not found" });
        }
        console.log("✅ Order found:", order);

        const buyerEmail = order.buyerId.email;
        console.log("🔸 Buyer's Email:", buyerEmail);
        console.log("🔹 Sending OTP:", order.otp);

        // Send OTP email to buyer
        await sendEmail(buyerEmail, "Confirm Your Order", `Your order OTP is ${order.otp}`);
        console.log("✅ OTP email sent to buyer.");

        res.json({ message: "OTP sent to buyer." });
    } catch (error) {
        console.error("❌ Error sending OTP to buyer:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// **Verify Order OTP**
export const verifyOrderOtp = async (req, res) => {
    const { orderId, otp } = req.body;
    const buyerIdFromToken = req.user.id; // Extracted from token using `protect` middleware

    try {
        console.log("\n🔹 Verify Order OTP API called");
        console.log("🔸 Order ID:", orderId);
        console.log("🔸 Received OTP:", otp);
        console.log("🔸 Authenticated Buyer ID:", buyerIdFromToken);

        // Fetch order details
        const order = await Order.findById(orderId);

        if (!order) {
            console.log("❌ Order not found!");
            return res.status(404).json({ message: "Order not found" });
        }
        console.log("✅ Order found:", order);

        // Ensure the order belongs to the authenticated buyer
        if (order.buyerId.toString() !== buyerIdFromToken) {
            console.log("❌ Unauthorized: Buyer does not match!");
            return res.status(403).json({ message: "Unauthorized: You are not the buyer of this order" });
        }

        console.log("🔹 Stored OTP:", order.otp);
        console.log("🔹 OTP Expiry Time:", order.otpExpires);

        // Check if OTP has expired
        if (new Date() > order.otpExpires) {
            console.log("❌ OTP Expired! Cancelling order...");
            order.status = "Cancelled"; // ❌ Auto-cancel order if expired
            order.otp = null;
            order.otpExpires = null;
            await order.save();
            return res.status(400).json({ message: "OTP expired, order has been cancelled" });
        }

        // Check if OTP is valid
        if (order.otp !== otp) {
            console.log("❌ Invalid OTP!");
            return res.status(400).json({ message: "Invalid OTP" });
        }

        console.log("✅ OTP Verified Successfully!");

        // Update order status
        order.status = "Confirmed";
        order.otp = null; // Clear OTP after verification
        order.otpExpires = null;
        await order.save();
        console.log("✅ Order status updated to Confirmed!");

        res.json({ message: "Order confirmed successfully!" });
    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


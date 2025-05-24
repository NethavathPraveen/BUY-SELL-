import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Function to generate a random OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Function to send OTP via email
export const sendOtpEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // App Password (Not your actual Gmail password)
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code for Verification",
            text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: "OTP sent successfully" };
    } catch (error) {
        console.error("Error sending OTP:", error);
        return { success: false, message: "Failed to send OTP" };
    }
};
export const sendOtpToBuyer = async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findById(orderId).populate("buyerId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const buyerEmail = order.buyerId.email;

        // Seller shares the OTP with the buyer
        await sendEmail(buyerEmail, "Confirm Your Order", `Your order OTP is ${order.otp}`);

        res.json({ message: "OTP sent to buyer." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
export const verifyOrderOtp = async (req, res) => {
    const { orderId, otp } = req.body;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.otp !== otp || new Date() > order.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        order.status = "Confirmed";
        order.otp = null; // Clear OTP after verification
        order.otpExpires = null;
        await order.save();

        res.json({ message: "Order confirmed successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


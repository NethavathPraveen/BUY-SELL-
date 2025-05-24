import cron from "node-cron";
import Order from "../models/Order.js";

// Schedule task to run every minute
cron.schedule("* * * * *", async () => {
    console.log("🔄 Checking for expired OTPs...");

    try {
        const expiredOrders = await Order.find({
            otpExpires: { $lt: new Date() }, // Find orders where OTP has expired
            status: "Awaiting OTP",
        });

        for (const order of expiredOrders) {
            console.log(`❌ Cancelling expired order: ${order._id}`);
            order.status = "Cancelled";
            order.otp = null;
            order.otpExpires = null;
            await order.save();
        }

        console.log("✅ Expired orders have been cancelled.");
    } catch (error) {
        console.error("❌ Error checking expired orders:", error);
    }
});

import express from "express";
import { placeOrder, sendOtpToBuyer, verifyOrderOtp } from "../Controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js"; // Middleware for authentication

const router = express.Router();

router.post("/place-order", protect, placeOrder);
router.post("/send-otp", protect, sendOtpToBuyer);
router.post("/verify-otp", protect, verifyOrderOtp);

export default router;

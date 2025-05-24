import express from 'express';
import { registerUser, loginUser,verifyOtp } from '../Controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/verify-otp", verifyOtp); 
export default router;

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import ProductRoutes from './routes/ProductRoutes.js';
import UserRoutes from './routes/userRoutes.js';  // Import user routes
import OrderRoutes from './routes/orderRoutes.js'; // Import order routes
import "./utils/cronJob.js"; 


dotenv.config();
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(cors());

// Routes
app.use("/api/products", ProductRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/orders", OrderRoutes); // Add order routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running at http://localhost:${PORT}`);
});

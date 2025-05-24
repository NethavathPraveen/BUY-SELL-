import express from 'express';
import { protect } from '../middlewares/authMiddleware.js'; // Import authentication middleware
import { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from '../Controllers/ProductController.js'; // Import controllers

const router = express.Router();

// Public route: Fetch all products
router.get("/", getProducts); 

// Protected routes: Only logged-in users can create, update, or delete products
router.post("/", protect, createProduct); 
router.put("/:id", protect, updateProduct); 
router.delete("/:id", protect, deleteProduct); 

export default router;

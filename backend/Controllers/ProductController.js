import mongoose from 'mongoose';
import Product from '../models/Product.js';

// ✅ Fetch all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Create a new product (Only logged-in sellers can create)
export const createProduct = async (req, res) => {
    const { name, price, quantity, image } = req.body;
    const sellerId = req.user._id; // Get seller ID from logged-in user

    if (!name || !price || !quantity || !image) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    try {
        const newProduct = new Product({ name, price, quantity, image, sellerId });
        await newProduct.save();
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: newProduct
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Update a product (Only the owner seller can update)
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const productData = req.body;
    const sellerId = req.user._id; // Logged-in seller

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Product ID" });
    }

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Only the seller who created the product can update it
        if (product.sellerId.toString() !== sellerId.toString()) {
            return res.status(403).json({ message: "Not authorized to update this product" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Delete a product (Only the owner seller can delete)
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const sellerId = req.user._id; // Logged-in seller

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Product ID" });
    }

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Only the seller who created the product can delete it
        if (product.sellerId.toString() !== sellerId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this product" });
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

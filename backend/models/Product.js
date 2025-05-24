import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Add sellerId
    isAvailable: { type: Boolean, default: true }, // ✅ Added availability field
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

// Middleware to update `isAvailable` based on quantity
ProductSchema.pre("save", function (next) {
  this.isAvailable = this.quantity > 0; // Set false if quantity reaches 0
  next();
});

const Product = mongoose.model("Product", ProductSchema);
export default Product;

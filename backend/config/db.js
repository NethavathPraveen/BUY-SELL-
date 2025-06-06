import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) { // ✅ Use "error" instead of "err"
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit the process on failure
    }
};

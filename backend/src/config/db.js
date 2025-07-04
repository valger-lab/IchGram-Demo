import mongoose from "mongoose";
import "dotenv/config";

const connectionString = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log("Connected successfully to MongoDB");
    return mongoose.connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

export default connectDB;

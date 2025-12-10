import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const standard = process.env.MONGODB_URI_STANDARD;
    if (standard) {
      await mongoose.connect(standard);
      console.log("MongoDB connected");
      return;
    }
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI environment variable is not set. Please add MONGODB_URI to your .env file."
      );
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    const fallback = process.env.MONGODB_URI_STANDARD;
    if (fallback) {
      try {
        await mongoose.connect(fallback);
        console.log("MongoDB connected");
        return;
      } catch {}
    }
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI environment variable is not set. Please add MONGODB_URI to your .env file."
      );
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    const msg = String(error?.message || "");
    const code = String(error?.code || "");
    const fallback = process.env.MONGODB_URI_STANDARD;
    if (fallback && (msg.includes("queryTxt") || msg.includes("querySrv") || code === "EBADRESP")) {
      try {
        await mongoose.connect(fallback);
        console.log("MongoDB connected");
        return;
      } catch (e) {}
    }
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;

import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const users = await User.find({}).select(
      "name email nim_nip role deleted createdAt"
    );
    console.log("Users in DB:");
    users.forEach((u) => console.log(u));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();

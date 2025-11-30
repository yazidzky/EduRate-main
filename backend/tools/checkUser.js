import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const nim = process.argv[2] || "ADMIN001";
    const user = await User.findOne({ nim_nip: nim });
    if (!user) {
      console.log("User not found for nim_nip:", nim);
      process.exit(0);
    }
    console.log("Found user:", {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      nim_nip: user.nim_nip,
      role: user.role,
      deleted: user.deleted,
    });

    const match = await user.comparePassword(process.argv[3] || "password");
    console.log("comparePassword('password') =>", match);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();

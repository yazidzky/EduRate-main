import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const email = process.argv[2] || "admin@edurate.com";
    const nim = process.argv[3] || "ADMIN001";
    const pwd = process.argv[4] || "password";

    const user = await User.findOne({ email });
    if (!user) {
      console.log("No user with email", email);
      process.exit(1);
    }

    user.nim_nip = nim;
    user.password = pwd; // will be hashed in pre-save
    await user.save();
    console.log(`Updated user ${email} -> nim_nip=${nim}`);
    const match = await user.comparePassword(pwd);
    console.log("comparePassword result:", match);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();

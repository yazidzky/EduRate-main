import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Institution from "./models/Institution.js";
import connectDB from "./config/database.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    const users = [
      {
        name: "Administrator",
        email: "admin@edurate.com",
        password: "password",
        role: "admin",
        nim_nip: "ADMIN001",
      },
      {
        name: "Dosen Demo",
        email: "dosen@edurate.com",
        password: "password",
        role: "dosen",
        nim_nip: "NIP001",
      },
      {
        name: "Mahasiswa Demo",
        email: "mahasiswa@edurate.com",
        password: "password",
        role: "mahasiswa",
        nim_nip: "NIM001",
      },
    ];

    for (const userData of users) {
      // Use upsert: if a user with the same email exists, update its fields; otherwise create.
      const filter = { email: userData.email };
      const update = {
        $set: {
          name: userData.name,
          role: userData.role,
          nim_nip: userData.nim_nip,
          institution: userData.institution || null,
          avatar: userData.avatar || null,
          deleted: false,
        },
        // If password is provided, set it. We set raw password and rely on pre-save only for create; for update we will hash manually below if needed.
      };

      // Attempt to find existing by email
      let existingUser = await User.findOne(filter);
      if (!existingUser) {
        // create new user (will be hashed by pre-save middleware)
        const created = new User(userData);
        await created.save();
        console.log(`${userData.role} user created: ${userData.nim_nip}`);
      } else {
        // Update fields; if password differs, update and let pre-save hash by saving the document
        let needsSave = false;
        if (existingUser.name !== userData.name)
          (existingUser.name = userData.name), (needsSave = true);
        if (existingUser.role !== userData.role)
          (existingUser.role = userData.role), (needsSave = true);
        if (existingUser.nim_nip !== userData.nim_nip)
          (existingUser.nim_nip = userData.nim_nip), (needsSave = true);
        if (existingUser.deleted)
          (existingUser.deleted = false), (needsSave = true);
        // If password provided and doesn't match, set it (comparePassword will check current hashed)
        const wantPassword = userData.password;
        if (wantPassword) {
          const match = await existingUser
            .comparePassword(wantPassword)
            .catch(() => false);
          if (!match) {
            existingUser.password = wantPassword;
            needsSave = true;
          }
        }

        if (needsSave) {
          await existingUser.save();
          console.log(`${userData.role} user updated: ${userData.nim_nip}`);
        } else {
          console.log(
            `${userData.role} user already up-to-date: ${userData.nim_nip}`
          );
        }
      }
    }

    console.log("Seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedData();

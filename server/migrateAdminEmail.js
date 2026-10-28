const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");

dotenv.config();

const migrateAdminEmail = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Set MONGODB_URI or MONGO_URI in server/.env.");
  }

  await mongoose.connect(mongoUri);

  try {
    const existingGmailAdmin = await User.findOne({ email: "admin@gmail.com", role: "admin" });
    if (existingGmailAdmin) {
      console.log("An admin account with admin@gmail.com already exists; no changes made.");
      return;
    }

    const result = await User.updateOne(
      { email: "admin@eventora.com", role: "admin" },
      { $set: { email: "admin@gmail.com" } }
    );

    if (result.modifiedCount === 1) {
      console.log("Updated the existing admin email to admin@gmail.com. Password and related records were preserved.");
    } else {
      console.log("No admin@eventora.com account was found; no changes made.");
    }
  } finally {
    await mongoose.disconnect();
  }
};

migrateAdminEmail().catch((error) => {
  console.error("Admin email migration failed:", error.message);
  process.exitCode = 1;
});

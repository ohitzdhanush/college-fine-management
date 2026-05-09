import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@college.edu";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required to seed the admin user.");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    register_number: { type: String },
    department: { type: String },
    role: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { collection: "users" }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

try {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    {
      $set: {
        name: "Administrator",
        email: ADMIN_EMAIL.toLowerCase(),
        password: passwordHash,
        department: "Administration",
        role: "admin",
      },
      $setOnInsert: {
        register_number: "ADMIN001",
        createdAt: new Date(),
      },
    },
    { new: true, upsert: true }
  ).lean();

  console.log("Admin user is ready.");
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
} catch (error) {
  console.error("Failed to seed admin user:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}

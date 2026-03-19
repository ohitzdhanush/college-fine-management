import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";

// ✅ Ensure MongoDB connection runs once when the model is imported
connectDB().catch((err) => {
  console.error("connectDB error:", err);
});

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  register_number: string;
  department: string;
  role: "admin" | "faculty" | "student";
  createdAt: Date;

  // Method for verifying password
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>({
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
});

// ✅ Pre-save middleware to hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// ✅ Instance method for comparing passwords during login
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Prevent model overwrite error during dev hot reloads
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;

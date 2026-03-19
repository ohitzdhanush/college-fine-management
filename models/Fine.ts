// models/Fine.ts
import mongoose, { Document, Model } from "mongoose";

export interface IFine extends Document {
  student: mongoose.Types.ObjectId;
  issuedBy: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  issuedDate: Date;
  dueDate: Date;
  status: "pending" | "paid" | "overdue";
  paymentDate?: Date | null;
  reminderSent?: Boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const FineSchema = new mongoose.Schema<IFine>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    reason: { type: String, required: true, trim: true },
    issuedDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    paymentDate: { type: Date, default: null },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// avoid model overwrite during dev hot reloads
const Fine: Model<IFine> =
  (mongoose.models.Fine as Model<IFine>) ||
  mongoose.model<IFine>("Fine", FineSchema);

export default Fine;

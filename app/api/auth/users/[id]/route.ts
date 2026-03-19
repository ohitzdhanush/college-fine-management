// app/api/users/[id]/route.ts
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!isValidObjectId(id))
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });

    const user = await User.findById(id).lean();
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const { password, ...rest } = user as any;
    return NextResponse.json({ user: rest }, { status: 200 });
  } catch (err) {
    console.error("Get user by id error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!isValidObjectId(id))
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });

    const payload = await req.json();

    // If password is included, we must set and save the document (so pre-save hooks run)
    if (payload.password) {
      const user = await User.findById(id);
      if (!user)
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      user.name = payload.name ?? user.name;
      user.email = payload.email ?? user.email;
      user.register_number = payload.register_number ?? user.register_number;
      user.department = payload.department ?? user.department;
      user.role = payload.role ?? user.role;
      user.password = payload.password; // hashed by pre-save
      await user.save();
      const userObj = user.toObject();
      delete (userObj as any).password;
      return NextResponse.json({ user: userObj }, { status: 200 });
    }

    // Otherwise use findByIdAndUpdate for simpler updates
    const updated = await User.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    const { password, ...rest } = updated as any;
    return NextResponse.json({ user: rest }, { status: 200 });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!isValidObjectId(id))
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });

    const deleted = await User.findByIdAndDelete(id).lean();
    if (!deleted)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const { password, ...rest } = deleted as any;
    return NextResponse.json(
      { user: rest, message: "User deleted" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

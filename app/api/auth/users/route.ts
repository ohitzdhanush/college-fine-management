import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");

    // Build filter condition
    const filter: Record<string, any> = {};
    if (department) {
      filter.department = department;
    }

    // Fetch users (optionally filtered)
    const users = await User.find(filter).sort({ createdAt: -1 }).lean();

    // Sanitize (remove passwords)
    const sanitized = users.map((u) => {
      const { password, ...rest } = u as any;
      return rest;
    });

    return NextResponse.json({ users: sanitized }, { status: 200 });
  } catch (err) {
    console.error("Get users error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, register_number, department, role } =
      await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "name, email, password and role are required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const user = new User({
      name,
      email,
      password,
      register_number,
      department,
      role,
    });
    await user.save();

    const userObj = user.toObject();
    delete (userObj as any).password;

    return NextResponse.json({ user: userObj }, { status: 201 });
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

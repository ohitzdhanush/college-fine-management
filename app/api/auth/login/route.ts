// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const userObj = user.toObject();
    delete (userObj as any).password;

    const token = generateToken({ id: user._id, role: user.role });

    return NextResponse.json({ user: userObj, token }, { status: 200 });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

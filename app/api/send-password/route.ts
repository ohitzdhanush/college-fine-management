// app/api/send-password/route.ts
import { NextResponse } from "next/server";
import { sendPasswordEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, plainPassword, name, loginUrl } = body;

    if (!to || !plainPassword) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const success = await sendPasswordEmail({
      to,
      plainPassword,
      name,
      loginUrl,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error in send-password API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

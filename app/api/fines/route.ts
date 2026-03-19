// app/api/fines/route.ts
import { sendFineNotificationEmail } from "@/lib/email";
import Fine from "@/models/Fine";
import User from "@/models/User";
import { NextResponse } from "next/server";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentRaw = searchParams.get("department");

    // normalize the department filter (trim + case-insensitive)
    const department =
      departmentRaw && departmentRaw.trim().length > 0
        ? departmentRaw.trim()
        : null;

    // build match object for populate (case-insensitive exact match)
    const studentMatch = department
      ? {
          department: {
            $regex: `^${escapeRegex(department)}$`,
            $options: "i",
          },
        }
      : {};

    const fines = await Fine.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "student",
        match: studentMatch,
        select: "-password -__v -salt", // drop sensitive fields; adjust as needed
      })
      .populate({
        path: "issuedBy",
        select: "-password -__v -salt",
      })
      .lean();

    // If department was provided, populated student will be null for non-matching fines.
    // Filter those out.
    const filteredFines = department ? fines.filter((f) => f.student) : fines;

    return NextResponse.json({ fines: filteredFines }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/fines error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      studentId, // required: ObjectId string of student user
      issuedById, // required: ObjectId string of faculty user
      amount,
      reason,
      issuedDate,
      dueDate,
      status, // optional; default pending
    } = body;

    if (
      !studentId ||
      !issuedById ||
      !amount ||
      !reason ||
      !issuedDate ||
      !dueDate
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // validate existence of student and faculty
    const student = await User.findById(studentId).select("-password -__v");
    const faculty = await User.findById(issuedById).select("-password -__v");

    if (!student)
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    if (!faculty)
      return NextResponse.json(
        { message: "Issuing faculty not found" },
        { status: 404 }
      );

    // create fine (store only references; user details are not duplicated)
    const fine = new Fine({
      student: student._id,
      issuedBy: faculty._id,
      amount,
      reason,
      issuedDate: new Date(issuedDate),
      dueDate: new Date(dueDate),
      status: status ?? "pending",
      paymentDate: null,
    });

    await fine.save();

    // return created fine with populated student & issuedBy
    const created = await Fine.findById(fine._id)
      .populate("student", "-password -__v")
      .populate("issuedBy", "-password -__v")
      .lean();

    // send immediate email (fire-and-forget but await to know success)
    try {
      await sendFineNotificationEmail({
        student: {
          name: student.name,
          email: student.email,
          register_number: (student as any).register_number,
        },
        issuedBy: {
          name: faculty.name,
          email: faculty.email,
          department: faculty.department,
        },
        amount: fine.amount,
        reason: fine.reason,
        issuedDate: fine.issuedDate,
        dueDate: fine.dueDate,
        status: fine.status,
        paymentDate: fine.paymentDate,
        fineId: String(fine._id),
      });
    } catch (e) {
      console.error("Failed to send immediate fine email:", e);
    }

    return NextResponse.json({ fine: created }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/fines error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// app/api/fines/student/[id]/route.ts
import Fine from "@/models/Fine"; // adjust path to your Fine model
import type { PipelineStage } from "mongoose";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

/**
 * GET /api/fines/student/:id
 * Returns:
 * {
 *   studentId: string,
 *   totalFinesCount: number,
 *   totalFineAmount: number
 * }
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id;

    // validate id
    if (!studentId || !Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { message: "Invalid student id" },
        { status: 400 }
      );
    }

    const studentObjectId = new Types.ObjectId(studentId);

    // Aggregation pipeline: match fines by student id, group to get count and sum
    const pipeline: PipelineStage[] = [
      { $match: { student: studentObjectId } },
      {
        $group: {
          _id: "$student",
          totalFinesCount: { $sum: 1 },
          totalFineAmount: { $sum: { $ifNull: ["$amount", 0] } },
        },
      },
    ];

    const result = await Fine.aggregate(pipeline);

    if (!result || result.length === 0) {
      // No fines for this student
      return NextResponse.json(
        {
          studentId,
          totalFinesCount: 0,
          totalFineAmount: 0,
        },
        { status: 200 }
      );
    }

    const { totalFinesCount = 0, totalFineAmount = 0 } = result[0];

    return NextResponse.json(
      {
        studentId,
        totalFinesCount,
        totalFineAmount,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/fines/student/:id error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const facultyFineStats = await User.aggregate([
      {
        $match: { role: "faculty" }, // Only faculty members
      },
      {
        $lookup: {
          from: "fines", // Mongo collection name
          localField: "_id",
          foreignField: "issuedBy",
          as: "issuedFines",
        },
      },
      {
        $addFields: {
          issuedFineCount: { $size: "$issuedFines" }, // Count fines per faculty
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          department: 1,
          issuedFineCount: 1,
        },
      },
      { $sort: { issuedFineCount: -1 } },
    ]);

    return NextResponse.json({ facultyFineStats });
  } catch (error) {
    console.error("Error fetching fine stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch faculty fine stats" },
      { status: 500 }
    );
  }
}

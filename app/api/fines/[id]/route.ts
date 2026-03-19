// app/api/fines/[id]/route.ts
import Fine from "@/models/Fine";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const fine = await Fine.findById(id)
      .populate("student", "-password -__v")
      .populate("issuedBy", "-password -__v")
      .lean();

    if (!fine)
      return NextResponse.json({ message: "Fine not found" }, { status: 404 });

    // map to the requested response shape (fineDetails)
    const fineDetails = {
      _id: fine?._id,
      student: fine.student ?? null,
      amount: fine.amount,
      reason: fine.reason,
      issuedBy: fine.issuedBy ?? null,
      issuedDate: fine.issuedDate,
      dueDate: fine.dueDate,
      status: fine.status,
      paymentDate: fine.paymentDate ?? null,
    };

    return NextResponse.json({ fine: fineDetails }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/fines/:id error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    // allow only status and optional paymentDate updates
    const { status, paymentDate } = body;
    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }
    if (!["pending", "paid", "overdue"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    const fine = await Fine.findById(id);
    if (!fine)
      return NextResponse.json({ message: "Fine not found" }, { status: 404 });

    fine.status = status as any;
    fine.paymentDate = paymentDate ? new Date(paymentDate) : fine.paymentDate;

    await fine.save();

    const updated = await Fine.findById(id)
      .populate("student", "-password -__v")
      .populate("issuedBy", "-password -__v")
      .lean();

    return NextResponse.json({ fine: updated }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/fines/:id error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const fine = await Fine.findByIdAndDelete(id);
    if (!fine)
      return NextResponse.json({ message: "Fine not found" }, { status: 404 });

    return NextResponse.json({ message: "Fine deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/fines/:id error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

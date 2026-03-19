// app/api/run-fine-reminders/route.ts
import { sendFineReminderEmail } from "@/lib/email";
import Fine from "@/models/Fine";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Helper: get start/end of date N days from today (server local time).
 * We calculate tomorrow/target days using UTC-safe approach to avoid timezone drift.
 */
function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}
function endOfDay(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
}

/**
 * Protect POST with secret: set NEXT_PUBLIC_CRON_SECRET (or CRON_SECRET) in env.
 * NOTE: Using NEXT_PUBLIC_... exposes it to client; prefer CRON_SECRET server-only in production.
 */
const CRON_SECRET =
  process.env.CRON_SECRET ||
  process.env.NEXT_PUBLIC_CRON_SECRET ||
  "local-secret";

/**
 * Small helper to safely get detailed user info for email payload.
 */
async function fetchUserSafe(userRef: any) {
  if (!userRef) return null;
  try {
    const u = await User.findById(userRef._id || userRef);
    return u || null;
  } catch (err) {
    console.error("fetchUserSafe error", err);
    return null;
  }
}

/**
 * Core: process a single fine (send email if pending & conditions match)
 * Returns object { fineId, success, error }
 */
async function processFineReminder(fine: any) {
  try {
    // Only process pending fines
    if (fine.status !== "pending") {
      return {
        fineId: String(fine._id),
        skipped: true,
        reason: "status != pending",
      };
    }

    const student = await fetchUserSafe(fine.student);
    const issuedBy = await fetchUserSafe(fine.issuedBy);

    await sendFineReminderEmail({
      student: {
        name: student?.name,
        email: student?.email,
        register_number: student?.register_number,
      },
      issuedBy: {
        name: issuedBy?.name,
        email: issuedBy?.email,
        department: issuedBy?.department,
      },
      amount: fine.amount,
      reason: fine.reason,
      dueDate: fine.dueDate,
      issuedDate: fine.issuedDate,
      fineId: String(fine._id),
      status: fine.status,
    });

    return { fineId: String(fine._id), success: true };
  } catch (err: any) {
    console.error(`Error sending reminder for fine ${fine._id}`, err);
    return {
      fineId: String(fine._id),
      success: false,
      error: err?.message || String(err),
    };
  }
}

/**
 * GET: process all fines due in exactly 3 days (from today) and pending.
 * POST: optionally trigger a single fine reminder. Use header 'x-cron-secret' or body.secret to protect the endpoint.
 */
export async function GET() {
  try {
    const today = new Date();

    // target = 3 days from now
    const target = new Date(today);
    target.setUTCDate(target.getUTCDate() + 3);

    const start = startOfDay(target);
    const end = endOfDay(target);

    // DB query: dueDate between start and end, status pending
    const fines = await Fine.find({
      dueDate: { $gte: start, $lte: end },
      status: "pending",
    }).lean();

    if (!fines?.length) {
      return NextResponse.json({
        message: "No pending fines due in 3 days",
        remindersSent: 0,
      });
    }

    // Process concurrently but safely. If you expect huge volume, add batching or use a queue.
    const results = await Promise.allSettled(
      fines.map((f) => processFineReminder(f))
    );

    const summary = {
      total: fines.length,
      sent: results.filter(
        (r: any) => r.status === "fulfilled" && r.value?.success
      ).length,
      skipped: results.filter(
        (r: any) => r.status === "fulfilled" && r.value?.skipped
      ).length,
      failed: results
        .filter(
          (r: any) => r.status === "fulfilled" && r.value?.success === false
        )
        .map((r: any) => r.value),
    };

    return NextResponse.json({ message: "Reminders processed", summary });
  } catch (err: any) {
    console.error("GET /run-fine-reminders error", err);
    return NextResponse.json(
      { message: "Internal error", error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const headerSecret = (request.headers.get("x-cron-secret") || "").trim();
    const suppliedSecret = headerSecret || body.secret;

    if (!suppliedSecret || suppliedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { message: "Forbidden: invalid secret" },
        { status: 403 }
      );
    }

    // support sending a specific fineId
    const fineId = body.fineId;
    if (!fineId) {
      return NextResponse.json(
        { message: "Bad request: missing fineId" },
        { status: 400 }
      );
    }

    const fine = await Fine.findById(fineId).lean();
    if (!fine) {
      return NextResponse.json(
        { message: "Not found: fine not present" },
        { status: 404 }
      );
    }

    const result = await processFineReminder(fine);
    if (result.success) {
      return NextResponse.json({
        message: "Reminder sent",
        fineId: result.fineId,
      });
    } else if (result.skipped) {
      return NextResponse.json(
        { message: "Skipped", detail: result },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to send reminder", detail: result },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("POST /run-fine-reminders error", err);
    return NextResponse.json(
      { message: "Internal error", error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

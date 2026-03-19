"use client";

import React, { useEffect, useState } from "react";
import { useFetchFines } from "@/components/services/useFetchFines";
import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Trash2, Check, BellRing } from "lucide-react";
import DeleteUserModal from "@/components/DeleteUserModal";
import ConfirmModal from "@/components/admin/ConfirmModal";

type UserRef = {
  _id?: string;
  name?: string;
  email?: string;
  register_number?: string;
  department?: string;
  role?: string;
  createdAt?: string;
};

type FineDetailsShape = {
  student: UserRef | null;
  amount: number;
  reason: string;
  issuedBy: UserRef | null;
  issuedDate: string | Date;
  dueDate: string | Date;
  status: "pending" | "paid" | "overdue";
  paymentDate?: string | Date | null;
  _id?: string;
};

export default function FineDetailsPage() {
  const user = JSON.parse(localStorage.getItem("app_user") || "");
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname?.split("/").pop() || "";
  const { getFineById, updateFine, deleteFine, dataLoading } = useFetchFines();

  const [fine, setFine] = useState<FineDetailsShape | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const res = await getFineById(id);
        setFine(res);
      } catch (err: any) {
        console.error("Error fetching fine:", err);
        toast.error("Failed to load fine details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!id) {
    return <div className="p-6">Invalid fine id</div>;
  }

  const formatDate = (d?: string | Date | null) => {
    if (!d) return "—";
    try {
      return format(new Date(d), "dd MMM yyyy, hh:mm a");
    } catch {
      return String(d);
    }
  };

  const statusColor = (s: FineDetailsShape["status"]) => {
    switch (s) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const handleMarkPaid = async () => {
    if (!fine?._id) return;
    if (fine.status === "paid") return toast.success("Already paid");

    const ok = confirm(
      "Mark this fine as PAID? This will set payment date to now."
    );
    if (!ok) return;

    setActionLoading(true);
    try {
      const payload = {
        status: "paid",
        paymentDate: new Date().toISOString(),
      };
      await updateFine(fine._id, payload);
      toast.success("Marked as paid");
      const refreshed = await getFineById(fine._id);
      setFine(refreshed);
    } catch (err: any) {
      console.error("Mark paid error:", err);
      toast.error(err?.message || "Failed to mark paid");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!fine?._id) return;

    setActionLoading(true);
    try {
      await deleteFine(fine._id);
      toast.success("Fine deleted Successfully");
      const user = JSON.parse(localStorage.getItem("app_user") || "null");
      router.push(`/dashboard/${user?.role}`);
    } catch (err: any) {
      console.error("Delete fine error:", err);
      toast.error(err?.message || "Failed to delete fine");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReminderNow = async () => {
    if (!fine?._id) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/fines/send-reminders", {
        method: "POST", // use POST for one-off actions with a body
        headers: {
          "Content-Type": "application/json",
          // WARNING: exposing a secret in a client bundle is insecure.
          // If you must use a secret from client-side env, ensure it's NEXT_PUBLIC_*
          "x-cron-secret":
            (process.env.NEXT_PUBLIC_CRON_SECRET as string) || "local-secret",
        },
        body: JSON.stringify({ fineId: fine._id }),
      });

      // parse JSON safely
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Reminder API error:", payload);
        toast.error(payload?.message || "Failed to send reminder");
      } else {
        toast.success(
          payload?.message || `Reminder sent (${payload.fineId ?? "ok"})`
        );
      }
    } catch (err: any) {
      console.error("Send reminder error:", err);
      toast.error("Failed to send reminder");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer hover:shadow-md transition-all duration-300"
            onClick={() => {
              const user = JSON.parse(
                localStorage.getItem("app_user") || "null"
              );
              router.push(`/dashboard/${user?.role}`);
            }}
            disabled={actionLoading}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="bg-transparent text-black rounded-2xl px-4 py-2">
            <h1 className="text-xl font-semibold">Fine details</h1>
            <p className="text-sm opacity-90">Detailed view & quick actions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {fine?.status !== "paid" && user?.role !== "student" && (
            <button
              onClick={handleSendReminderNow}
              disabled={actionLoading || loading || !fine}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-50 hover:scale-105 transform transition disabled:opacity-60 cursor-pointer"
            >
              <BellRing className="w-4 h-4" /> Send reminder
            </button>
          )}

          {user?.role === "admin" && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              disabled={actionLoading || loading || !fine}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border hover:shadow-md transition disabled:opacity-60 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-600" /> Delete
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 text-center text-gray-500">
          Loading fine details…
        </div>
      ) : !fine ? (
        <div className="mt-8 p-6 bg-red-50 text-red-700 rounded">
          Fine not found.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: student card */}
          <div className="col-span-1 bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-5 shadow-md">
            <div className="flex items-start flex-col gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 via-pink-500 to-rose-400 text-white text-4xl font-semibold shadow">
                {fine.student?.name?.[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {fine.student?.name ?? "—"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {fine.student?.email ?? "—"}
                </p>
                <p className="text-sm mt-1">
                  Reg:{" "}
                  <span className="font-medium">
                    {fine.student?.register_number ?? "—"}
                  </span>
                </p>
                <p className="text-sm">
                  Dept:{" "}
                  <span className="font-medium">
                    {fine.student?.department ?? "—"}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm text-muted-foreground">
                Issued by {user?.role === "faculty" && "(You)"}
              </h4>
              <div className="mt-2 bg-white rounded-lg p-3 shadow-sm">
                <p className="font-medium">{fine.issuedBy?.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {fine.issuedBy?.email ?? "—"}
                </p>
                <p className="text-xs">
                  Dept: {fine.issuedBy?.department ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Middle column: details card */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <div className="mt-1 inline-flex items-center gap-3">
                  <span className="text-3xl font-extrabold">
                    ₹{fine.amount.toLocaleString()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-medium ${statusColor(
                      fine.status
                    )}`}
                  >
                    {fine.status.toUpperCase()}
                  </span>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">Reason</p>
                <p className="mt-1 text-base leading-relaxed">{fine.reason}</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Payment</p>
                <p className="font-medium">
                  {fine.paymentDate ? formatDate(fine.paymentDate) : "—"}
                </p>

                {user?.role !== "student" && (
                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      onClick={handleMarkPaid}
                      disabled={actionLoading || fine.status === "paid"}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 hover:scale-105 transition disabled:opacity-60 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-green-600" /> Mark paid
                    </button>

                    {fine?.status !== "paid" && (
                      <button
                        onClick={handleSendReminderNow}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 hover:scale-105 transition disabled:opacity-60 cursor-pointer"
                      >
                        <BellRing className="w-4 h-4 text-indigo-600" /> Send
                        reminder
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <hr className="my-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Issued Date</p>
                <p className="mt-1 font-medium">
                  {formatDate(fine.issuedDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="mt-1 font-medium">{formatDate(fine.dueDate)}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {user?.role === "admin" && (
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border hover:shadow-md transition disabled:opacity-60 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" /> Delete fine
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-50 hover:shadow-md transition cursor-pointer"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Fine"
        message="This action will permanently delete the fine. Are you sure?"
        loading={!!dataLoading}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await handleDelete();
        }}
      />
    </div>
  );
}

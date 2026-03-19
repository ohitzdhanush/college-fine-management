"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockFines } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { Search, CreditCard } from "lucide-react";
import type { Fine } from "@/lib/mock-data";
import { filterFinesByStudent } from "@/lib/filterFinesByStudent";
import { useAppSelector } from "@/lib/hooks";

interface FineHistoryTableProps {
  onPaymentClick: (fine: Fine) => void;
}

export function FineHistoryTable({ onPaymentClick }: FineHistoryTableProps) {
  const user = JSON.parse(localStorage.getItem("app_user") || "");
  const { fines } = useAppSelector((state) => state.fines);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "paid" | "overdue"
  >("all");

  const result = filterFinesByStudent(fines, user?.id);

  const dateOnly = (isoDate: any) =>
    new Date(isoDate).toLocaleDateString("en-IN");

  // Filter fines for current student
  let studentFines = result;

  if (filterStatus !== "all") {
    studentFines = studentFines.filter((fine) => fine.status === filterStatus);
  }

  studentFines = studentFines.filter(
    (fine) =>
      fine.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.issuedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="p-6 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fine History</h3>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by reason or issued by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "paid", "overdue"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className={
                filterStatus === status
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  : "border-gray-300 bg-transparent cursor-pointer"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Amount
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Reason
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Issued By
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Issued Date
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Due Date
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Status
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {studentFines.length > 0 ? (
              studentFines.map((fine) => (
                <tr
                  key={fine._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    ₹{fine.amount}
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                    {fine.reason}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {fine.issuedBy?.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {dateOnly(fine.issuedDate)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {dateOnly(fine.dueDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                        fine.status
                      )}`}
                    >
                      {fine.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {fine.status !== "paid" ? (
                      <Button
                        size="sm"
                        onClick={() => onPaymentClick(fine)}
                        className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Paid on {dateOnly(fine.paymentDate)}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                  No fines found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

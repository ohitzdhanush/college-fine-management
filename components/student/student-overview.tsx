"use client";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { filterFinesByStudent } from "@/lib/filterFinesByStudent";
import { useAppSelector } from "@/lib/hooks";
import { mockFines } from "@/lib/mock-data";
import { AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react";

export function StudentOverview() {
  const user = JSON.parse(localStorage.getItem("app_user") || "");
  const { fines } = useAppSelector((state) => state.fines);
  const result = filterFinesByStudent(fines, user?.id);

  // Filter fines for current student
  const studentFines = result;

  const totalFines = result.length;
  const totalAmount = studentFines.reduce((sum, fine) => sum + fine.amount, 0);
  const paidAmount = studentFines
    .filter((f) => f.status === "paid")
    .reduce((sum, fine) => sum + fine.amount, 0);
  const pendingAmount = studentFines
    .filter((f) => f.status === "pending")
    .reduce((sum, fine) => sum + fine.amount, 0);
  const overdueAmount = studentFines
    .filter((f) => f.status === "overdue")
    .reduce((sum, fine) => sum + fine.amount, 0);

  const stats = [
    {
      title: "Total Fines",
      value: totalFines,
      icon: AlertCircle,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Amount",
      value: `₹${totalAmount}`,
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Paid Amount",
      value: `₹${paidAmount}`,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Pending Amount",
      value: `₹${pendingAmount + overdueAmount}`,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Paid</span>
              <span className="font-semibold text-green-600">
                ₹{paidAmount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${
                    totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">
                ₹{pendingAmount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full"
                style={{
                  width: `${
                    totalAmount > 0 ? (pendingAmount / totalAmount) * 100 : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-600">Overdue</span>
              <span className="font-semibold text-red-600">
                ₹{overdueAmount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${
                    totalAmount > 0 ? (overdueAmount / totalAmount) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Account Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Registration Number</p>
              <p className="font-medium text-gray-900">
                {user?.register_number}
              </p>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{pendingAmount + overdueAmount}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

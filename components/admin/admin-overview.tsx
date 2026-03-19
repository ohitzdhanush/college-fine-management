"use client";

import { Card } from "@/components/ui/card";
import { useAppSelector } from "@/lib/hooks";
import { mockFaculty, mockFines } from "@/lib/mock-data";
import { AlertCircle, BookOpen, DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetchUsers } from "../services/UserServices";
import { useFetchFines } from "../services/useFetchFines";
import { Skeleton } from "../ui/skeleton";

export function AdminOverview() {
  const { student, faculty } = useAppSelector((state) => state.user);
  const { fines } = useAppSelector((state) => state.fines);

  const { dataLoading } = useFetchFines();

  const [totalAmount, setTotalAmount] = useState<any>(0);
  const [facultyStats, setFacultyStats] = useState<any[]>([]);
  const [facultyStatsLoading, setFacultyStatsLoading] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setFacultyStatsLoading(true);
        const res = await fetch("/api/fines/faculty-stats");
        const data = await res.json();
        setFacultyStats(data.facultyFineStats || []);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setFacultyStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (fines?.length > 0) {
      setTotalAmount(fines?.reduce((sum, fine) => sum + fine.amount, 0));
    }
  }, [fines]);

  const paidAmount = fines
    .filter((f) => f.status === "paid")
    .reduce((sum, fine) => sum + fine.amount, 0);
  const pendingAmount = fines
    .filter((f) => f.status === "pending")
    .reduce((sum, fine) => sum + fine.amount, 0);
  const overdueAmount = fines
    .filter((f) => f.status === "overdue")
    .reduce((sum, fine) => sum + fine.amount, 0);

  const stats = [
    {
      title: "Total Students",
      value: student?.length,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Faculty",
      value: faculty?.length,
      icon: BookOpen,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Fines",
      value: fines?.length,
      icon: AlertCircle,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Total Amount",
      value: `₹${totalAmount}`,
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
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
                  {dataLoading ? (
                    <Skeleton className="w-[90px] h-[36px]" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  )}
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
            Fine Status Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Paid</span>
              <span className="font-semibold text-green-600">
                ₹{paidAmount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${(paidAmount / totalAmount) * 100}%` }}
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
                style={{ width: `${(pendingAmount / totalAmount) * 100}%` }}
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
                style={{ width: `${(overdueAmount / totalAmount) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 3 Faculty by Fines Issued
          </h3>
          <div className="space-y-3">
            {facultyStats.length === 0 && facultyStatsLoading ? (
              <>
                <Skeleton className="h-[50px] my-2  w-full" />
                <Skeleton className="h-[50px] my-2  w-full" />
                <Skeleton className="h-[50px] my-2  w-full" />
              </>
            ) : facultyStats.length === 0 ? (
              <div className="pt-8 pb-4 text-center text-gray-400 w-full min-h-full flex items-center justify-center">
                No fines have been issued yet.
              </div>
            ) : (
              facultyStats.slice(0, 3).map((faculty) => (
                <div
                  key={faculty._id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{faculty.name}</p>
                    <p className="text-sm text-gray-500">
                      {faculty.department}
                    </p>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {faculty.issuedFineCount}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

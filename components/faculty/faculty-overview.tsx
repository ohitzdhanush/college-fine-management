"use client";

import { Card } from "@/components/ui/card";
import { getTopStudentsFromFines } from "@/lib/getTopStudentsFromFines";
import { useAppSelector } from "@/lib/hooks";
import { AlertCircle, BookOpen, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useFetchFines } from "../services/useFetchFines";

export function FacultyOverview() {
  const { student } = useAppSelector((state) => state.user);
  const { fines } = useAppSelector((state) => state.fines);
  const { dataLoading } = useFetchFines();

  const totalStudents = student.length;
  const studentsWithFines = getTopStudentsFromFines(
    fines,
    fines?.length
  ).length;
  const totalFinesAmount = fines.reduce((sum, s) => sum + s.amount, 0);
  const avgFinesPerStudent =
    totalStudents > 0 ? (totalFinesAmount / studentsWithFines).toFixed(2) : 0;

  const stats = [
    {
      title: "Total Students",
      value: student?.length,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Students with Fines",
      value: getTopStudentsFromFines(fines, fines?.length).length,
      icon: AlertCircle,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Total Fines Amount",
      value: `₹${totalFinesAmount}`,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Avg Fine per Student",
      value: isNaN(parseInt(avgFinesPerStudent || ""))
        ? "0"
        : `₹${avgFinesPerStudent}`,
      icon: BookOpen,
      color: "bg-green-100 text-green-600",
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
            Student Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Students without fines</span>
              <span className="font-semibold text-green-600">
                {totalStudents - studentsWithFines}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${
                    totalStudents > 0
                      ? ((totalStudents - studentsWithFines) / totalStudents) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-600">Students with fines</span>
              <span className="font-semibold text-red-600">
                {studentsWithFines}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${
                    totalStudents > 0
                      ? (studentsWithFines / totalStudents) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Students with Fines
          </h3>
          <div className="space-y-3">
            {dataLoading ? (
              <>
                <Skeleton className="h-[51px] my-2  w-full" />
                <Skeleton className="h-[51px] my-2  w-full" />
                <Skeleton className="h-[51px] my-2  w-full" />
              </>
            ) : getTopStudentsFromFines(fines, 3)?.length === 0 ? (
              <div className="pt-8 pb-4 text-center text-gray-400 w-full min-h-full flex items-center justify-center">
                No fines have been issued yet.
              </div>
            ) : (
              getTopStudentsFromFines(fines, 3).map((fine, index) => (
                <div
                  key={`${fine.totalFinesCount}-${index}`}
                  className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {fine.studentName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {fine.totalFinesCount} fine
                      {fine.totalFinesCount > 1 && "(s)"}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ₹{fine.totalFineAmount}
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

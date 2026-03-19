"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/lib/hooks";
import { truncateText } from "@/lib/utils/truncateText";
import { Plus, Search, ViewIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FineFilterDropdown from "../FineFilterDropdown";
import FineModal from "../FineModal";
import { useFetchFines } from "../services/useFetchFines";
import { Skeleton } from "../ui/skeleton";

export function FineManagement() {
  const router = useRouter();
  const { postFine, dataLoading, deleteFine } = useFetchFines();
  const { faculty: facultys, student } = useAppSelector((state) => state.user);
  const { fines: fine } = useAppSelector((state) => state.fines);

  const user = JSON.parse(localStorage.getItem("app_user") || "");

  const [searchTerm, setSearchTerm] = useState("");
  const [fines, setFines] = useState<any>(fine);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "",
    reason: "",
    dueDate: "",
    issuedBy: user?.id,
    status: "pending",
  });

  useEffect(() => {
    setFines(fine);
  }, [fine]);

  const filteredFines = fines.filter((fine: any) => {
    const matchesSearch =
      fine?.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine?.student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine?.student?.register_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const isOverdue =
      fine.status === "pending" && new Date(fine.dueDate) < new Date();

    const matchesFilter =
      filter === "all" ||
      (filter === "paid" && fine.status === "paid") ||
      (filter === "pending" &&
        fine.status === "pending" &&
        new Date(fine.dueDate) >= new Date()) ||
      (filter === "overdue" && isOverdue);

    return matchesSearch && matchesFilter;
  });

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

  const handleSaveFine = async (formData: any) => {
    if (
      !formData.studentId ||
      !formData.amount ||
      !formData.reason ||
      !formData.dueDate ||
      !formData.issuedBy
    ) {
      alert("Please fill all fields");
      return;
    }

    const students = student.find((s) => s._id === formData.studentId);
    if (!students) {
      alert("Student not found");
      return;
    }

    const newFine = {
      studentId: formData.studentId,
      amount: Number.parseInt(formData.amount),
      reason: formData.reason,
      issuedById: formData.issuedBy,
      issuedDate: new Date().toString(),
      dueDate: formData.dueDate,
      status: "pending" as const,
    };
    await postFine(newFine);

    setFormData({
      studentId: "",
      amount: "",
      reason: "",
      dueDate: "",
      issuedBy: user?.id,
      status: "",
    });
    setEditingId(null);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-gray-200">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-900">All Fines</h3>
          <div className="flex items-center gap-4">
            <FineFilterDropdown
              onFilterChange={(f) => setFilter(f)}
              initial="all"
            />
            <Button
              onClick={() => {
                setFormData({
                  studentId: "",
                  amount: "",
                  reason: "",
                  dueDate: "",
                  issuedBy: user?.id,
                  status: "",
                });
                setEditingId(null);
                setShowAddModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Issue New Fine
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by student name, email, or registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Student
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Registration
                </th>
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
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.length > 0 ? (
                filteredFines.map((fine: any, index: number) =>
                  dataLoading ? (
                    <tr key={fine._id}>
                      <td colSpan={7}>
                        <Skeleton className="h-[50px] my-2  w-full" />
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={fine._id}
                      className={`${
                        index === filteredFines?.length - 1
                          ? "border-none"
                          : "border-b"
                      } border-gray-100 hover:bg-gray-50`}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {fine?.student?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {fine.student?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {fine?.student?.register_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        ₹{fine?.amount}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {truncateText(fine.reason, 10)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {fine.issuedBy?.name}
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
                      <td className="py-3 px-4 flex items-center justify-center mt-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 bg-transparent cursor-pointer text-gray-600"
                          onClick={() => {
                            router.push(`/fines/${fine._id}`);
                          }}
                        >
                          <ViewIcon className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="pt-8 pb-4 text-center text-gray-400"
                  >
                    No Fines Issued
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <FineModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        formData={formData}
        setFormData={setFormData}
        students={student}
        faculty={facultys}
        onSave={handleSaveFine}
        editingId={editingId}
      />
    </div>
  );
}

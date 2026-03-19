"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/lib/hooks";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetchUsers } from "../services/UserServices";
import StudentModal from "../student/StudentModal";
import { Skeleton } from "../ui/skeleton";
import DeleteUserModal from "../DeleteUserModal";
import { computeStudentTotalsFromFines } from "@/lib/computeStudentTotalsFromFines";

export function StudentManagement() {
  const { student } = useAppSelector((state) => state.user);
  const { fines } = useAppSelector((state) => state.fines);
  const {
    postUser,
    updateUser,
    deleteUser,
    dataLoading,
    getAllDepartmentUsers,
  } = useFetchUsers();

  const user = JSON.parse(localStorage?.getItem("app_user") || "");

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState(
    student.filter((el) => el.department == user?.department) || []
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    register_number: "",
    department: "",
  });

  useEffect(() => {
    setStudents(student);
  }, [student]);

  const filteredStudents = students
    .filter(
      (student) =>
        student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student?.register_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  const handleSaveStudent = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.register_number ||
      !formData.department
    ) {
      alert("Please fill all fields");
      return;
    }

    if (editingId) {
      await updateUser(editingId, {
        name: formData?.name,
        register_number: formData?.register_number,
        department: formData?.department,
      });
    } else {
      const newStudent = {
        name: formData.name,
        email: formData.email,
        register_number: formData.register_number,
        department: formData.department,
        totalFines: 0,
        fineCount: 0,
        role: "student",
      };

      postUser(newStudent).then(async () => {
        await getAllDepartmentUsers(user?.department);
      });
    }

    setFormData({
      name: "",
      email: "",
      register_number: "",
      department: "",
    });
    setEditingId(null);
    setShowAddModal(false);
  };

  const handleEditStudent = (student: any) => {
    setFormData({
      name: student.name,
      email: student.email,
      register_number: student.register_number,
      department: student.department,
    });
    setEditingId(student._id);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-gray-200">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Student Credentials Management
          </h3>
          <Button
            onClick={() => {
              setFormData({
                name: "",
                email: "",
                register_number: "",
                department: "",
              });
              setEditingId(null);
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or registration number..."
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
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Registration
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Department
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Total Fines
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents?.length > 0 ? (
                filteredStudents.map((student, index) =>
                  dataLoading ? (
                    <tr key={student._id}>
                      <td colSpan={6}>
                        <Skeleton className="h-[50px] my-2  w-full" />
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={student._id}
                      className={`${
                        index !== filteredStudents.length - 1
                          ? "border-b border-gray-100"
                          : "border-none"
                      } hover:bg-gray-50`}
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {student.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {student.email}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {student.register_number}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {student.department}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          ₹
                          {computeStudentTotalsFromFines(
                            fines,
                            student?._id || ""
                          )?.totalFineAmount || "0"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 bg-transparent cursor-pointer"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent cursor-pointer hover:text-red-500"
                            onClick={() => setDeleteUserId(`${student?._id}`)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="pt-8 pb-4 text-center text-gray-400"
                  >
                    No Students Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <StudentModal
        show={showAddModal}
        setShow={setShowAddModal}
        formData={formData}
        setFormData={setFormData}
        handleSaveStudent={handleSaveStudent}
        editingId={editingId}
      />

      <DeleteUserModal
        open={!!deleteUserId}
        setOpen={setDeleteUserId}
        user={students?.filter((el) => el?._id === deleteUserId)[0]}
        title="Delete Student"
        onConfirm={async (id) => {
          await deleteUser(id!);
          return true;
        }}
      />
    </div>
  );
}

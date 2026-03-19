"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/lib/hooks";
import { Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import FacultyModal from "../faculty/FacultyModal";
import { useFetchUsers } from "../services/UserServices";
import { Skeleton } from "../ui/skeleton";
import DeleteUserModal from "../DeleteUserModal";

export function FacultyManagement() {
  const { faculty: facultys } = useAppSelector((state) => state.user);

  const { postUser, updateUser, deleteUser, dataLoading } = useFetchUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [faculty, setFaculty] = useState(facultys);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });
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

  const findFacultyById = (id: string) => {
    const faculty = facultyStats?.find((el) => el?._id === id);

    return faculty?.issuedFineCount;
  };

  useEffect(() => {
    setFaculty(facultys);
  }, [facultys]);

  const filteredFaculty = faculty.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveFaculty = async () => {
    if (!formData.name || !formData.email || !formData.department) {
      alert("Please fill all fields");
      return;
    }

    if (editingId) {
      await updateUser(editingId, {
        name: formData?.name,
        department: formData?.department,
      });
    } else {
      const newFaculty = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        register_number: "",
        finesIssued: 0,
        role: "faculty",
      };

      postUser(newFaculty);
    }

    setFormData({ name: "", email: "", department: "" });
    setEditingId(null);
    setShowAddModal(false);
  };

  const handleEditFaculty = (f: any) => {
    setFormData({
      name: f.name,
      email: f.email,
      department: f.department,
    });
    setEditingId(f._id);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Faculty Credentials Management
          </h3>
          <Button
            onClick={() => {
              setFormData({ name: "", email: "", department: "" });
              setEditingId(null);
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or department..."
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
                  Department
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Fines Issued
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.length > 0 ? (
                filteredFaculty.map((f, index) =>
                  dataLoading ? (
                    <tr key={f._id}>
                      <td colSpan={6}>
                        <Skeleton className="h-[50px] my-2  w-full" />
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={f._id}
                      className={`${
                        index === filteredFaculty?.length - 1
                          ? "border-none"
                          : "border-b"
                      } border-gray-100 hover:bg-gray-50`}
                    >
                      <td className="py-3 px-4 text-gray-900">{f.name}</td>
                      <td className="py-3 px-4 text-gray-600">{f.email}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {f.department}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {findFacultyById(f._id || "")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 bg-transparent cursor-pointer"
                            onClick={() => handleEditFaculty(f)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent cursor-pointer hover:text-red-500"
                            onClick={() => setDeleteUserId(`${f._id}`)}
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
                    No Faculty Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <FacultyModal
        show={showAddModal}
        setShow={setShowAddModal}
        formData={formData}
        setFormData={setFormData}
        handleSaveFaculty={handleSaveFaculty}
        editingId={editingId}
      />

      <DeleteUserModal
        open={!!deleteUserId}
        setOpen={setDeleteUserId}
        user={faculty?.filter((el) => el?._id === deleteUserId)[0]}
        title="Delete Student"
        onConfirm={async (id) => {
          await deleteUser(id!);
          return true;
        }}
      />
    </div>
  );
}

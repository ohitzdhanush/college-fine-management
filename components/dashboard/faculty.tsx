"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { FacultyOverview } from "@/components/faculty/faculty-overview";
import { ProtectedRoute } from "@/components/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { FineManagement } from "../faculty/fine-management";
import { StudentManagement } from "../faculty/student-management";
import { useFetchUsers } from "../services/UserServices";
import { useFetchFines } from "../services/useFetchFines";

const Faculty = () => {
  const { getAllDepartmentUsers } = useFetchUsers();
  const { getAllDepartmentFines } = useFetchFines();

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("facultySelectedTab") || "overview"
  );

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("app_user") || "");
    getAllDepartmentUsers(user?.department);
    getAllDepartmentFines(user?.department).catch((e) => console.error(e));
  }, []);

  return (
    <ProtectedRoute requiredRole="faculty">
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Faculty Dashboard"
          subtitle="Manage students and issue fines"
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger
                value="overview"
                onClick={() =>
                  localStorage.setItem("facultySelectedTab", "overview")
                }
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="add-student"
                onClick={() =>
                  localStorage.setItem("facultySelectedTab", "add-student")
                }
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="issue-fine"
                onClick={() =>
                  localStorage.setItem("facultySelectedTab", "issue-fine")
                }
              >
                Issue Fine
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <FacultyOverview />
            </TabsContent>

            <TabsContent value="add-student" className="space-y-6">
              <StudentManagement />
            </TabsContent>

            <TabsContent value="issue-fine" className="space-y-6">
              <FineManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Faculty;

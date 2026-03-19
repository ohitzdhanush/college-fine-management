"use client";

import { AdminOverview } from "@/components/admin/admin-overview";
import { FacultyManagement } from "@/components/admin/faculty-management";
import { FineManagement } from "@/components/admin/fine-management";
import { StudentManagement } from "@/components/admin/student-management";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProtectedRoute } from "@/components/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useFetchUsers } from "../services/UserServices";
import { useFetchFines } from "../services/useFetchFines";

const Admin = () => {
  const { getAllUsrs } = useFetchUsers();
  const { getAllFines } = useFetchFines();

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("adminSelectedTab") || "overview"
  );

  useEffect(() => {
    getAllUsrs();
    getAllFines().catch((e) => console.error(e));
  }, []);

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="Manage the entire fine management system"
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger
                value="overview"
                onClick={() =>
                  localStorage.setItem("adminSelectedTab", "overview")
                }
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="students"
                onClick={() =>
                  localStorage.setItem("adminSelectedTab", "students")
                }
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="faculty"
                onClick={() =>
                  localStorage.setItem("adminSelectedTab", "faculty")
                }
              >
                Faculty
              </TabsTrigger>
              <TabsTrigger
                value="fines"
                onClick={() =>
                  localStorage.setItem("adminSelectedTab", "fines")
                }
              >
                Fines
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <AdminOverview />
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <StudentManagement />
            </TabsContent>

            <TabsContent value="faculty" className="space-y-6">
              <FacultyManagement />
            </TabsContent>

            <TabsContent value="fines" className="space-y-6">
              <FineManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;

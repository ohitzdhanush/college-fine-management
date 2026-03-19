"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { ProtectedRoute } from "@/components/protected-route";
import { FineHistoryTable } from "@/components/student/fine-history-table";
import { PaymentModal } from "@/components/student/payment-modal";
import { StudentOverview } from "@/components/student/student-overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Fine } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import { useFetchFines } from "../services/useFetchFines";

const Student = () => {
  const { getAllFines } = useFetchFines();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFine, setSelectedFine] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    getAllFines().catch((e) => console.error(e));
  }, []);

  const handlePaymentClick = (fine: any) => {
    setSelectedFine(fine);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    setSelectedFine(null);
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Student Dashboard"
          subtitle="View your fine history and manage payments"
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Fine History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <StudentOverview />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <FineHistoryTable onPaymentClick={handlePaymentClick} />
            </TabsContent>
          </Tabs>
        </main>

        {showPaymentModal && selectedFine && (
          <PaymentModal
            fine={selectedFine}
            onClose={() => setShowPaymentModal(false)}
            onComplete={handlePaymentComplete}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};
export default Student;

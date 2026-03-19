// hooks/useFetchFines.ts
"use client";

import { useAuth } from "@/lib/auth-context";
import { useAppDispatch } from "@/lib/hooks";
import { setFines } from "@/redux/slices/finesSlice";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

export const useFetchFines = () => {
  const user = JSON.parse(localStorage.getItem("app_user") || "");
  const dispatch = useAppDispatch();

  const [dataLoading, setDataLoading] = useState<Boolean>(false);

  // Base URL for fines endpoints. Adjust if your backend uses /api prefix (e.g. `${BASE}/api/fines`)
  const BASE = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 GET ALL FINES
  const getAllDepartmentFines = async (dep: string) => {
    try {
      const res = await axios.get(`${BASE}/fines?department=${dep}`);
      const allFines = res.data?.fines ?? res.data ?? [];

      // update redux
      dispatch(setFines({ fines: allFines }));
    } catch (error: any) {
      console.error("GET FINES Error:", error);
      toast.error(
        error?.response?.data?.message || error.message || "Failed to get fines"
      );
    }
  };

  const getAllFines = async () => {
    try {
      const res = await axios.get(`${BASE}/fines`);
      const allFines = res.data?.fines ?? res.data ?? [];

      // update redux
      dispatch(setFines({ fines: allFines }));
    } catch (error: any) {
      console.error("GET FINES Error:", error);
      toast.error(
        error?.response?.data?.message || error.message || "Failed to get fines"
      );
    }
  };

  // 🔹 GET SINGLE FINE (returns fine details shaped as { student: {...}, amount, reason, issuedBy: {...}, ... })
  const getFineById = async (id: string) => {
    try {
      const res = await axios.get(`${BASE}/fines/${id}`);
      // response expected: { fine: { ... } }
      const fine = res.data?.fine ?? null;
      return fine;
    } catch (error: any) {
      console.error("GET FINE BY ID Error:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to get fine details"
      );
      throw error;
    }
  };

  // 🔹 POST NEW FINE
  const postFine = async (payload: any) => {
    setDataLoading(true);
    try {
      await axios.post(`${BASE}/fines`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      toast.success("Fine Issued successfully!");
      // refresh list
      user?.role === "admin"
        ? await getAllFines()
        : user?.role === "faculty" &&
          (await getAllDepartmentFines(user?.department || "").catch((e) =>
            console.error(e)
          ));
    } catch (error: any) {
      console.error("POST FINE Error:", error);
      toast.error(error?.response?.data?.message || "Failed to create fine");
      throw error;
    } finally {
      setDataLoading(false);
    }
  };

  // 🔹 UPDATE FINE (status only)
  /**
   * payload example:
   * { status: "paid", paymentDate: "2025-01-20" }
   */
  const updateFine = async (id: string, payload: any) => {
    setDataLoading(true);
    try {
      const res = await axios.put(`${BASE}/fines/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      toast.success("Fine updated successfully!");
      // refresh list
      user?.role === "admin"
        ? await getAllFines()
        : user?.role === "faculty" &&
          (await getAllDepartmentFines(user?.department || "").catch((e) =>
            console.error(e)
          ));
      return res.data?.fine ?? res.data;
    } catch (error: any) {
      console.error("PUT FINE Error:", error);
      toast.error(error?.response?.data?.message || "Failed to update fine");
      throw error;
    } finally {
      setDataLoading(false);
    }
  };

  // 🔹 DELETE FINE
  const deleteFine = async (id: string) => {
    setDataLoading(true);
    try {
      const res = await axios.delete(`${BASE}/fines/${id}`, {
        withCredentials: true,
      });

      toast.success(res?.data?.message || "Fine deleted successfully!");
      await getAllFines();
      return res.data;
    } catch (error: any) {
      console.error("DELETE FINE Error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete fine");
      throw error;
    } finally {
      setDataLoading(false);
    }
  };

  return {
    getAllFines,
    getFineById,
    postFine,
    updateFine,
    deleteFine,
    getAllDepartmentFines,
    dataLoading,
  };
};

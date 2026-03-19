// hooks/useFetchUsers.ts
"use client";

import { useAppDispatch } from "@/lib/hooks";
import { generateStaticPassword } from "@/lib/utils/generateStaticPassword";
import { setUsers } from "@/redux/slices/usersSlice";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

export const useFetchUsers = () => {
  const user = JSON.parse(localStorage.getItem("app_user") || "");
  const dispatch = useAppDispatch();

  const [dataLoading, setDataLoading] = useState<Boolean>(false);

  const getAllUsrs = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users`
      );
      const allUsers = res.data?.users ?? res.data ?? [];

      const students = allUsers.filter((u: any) => u.role === "student");
      const faculty = allUsers.filter((u: any) => u.role === "faculty");

      dispatch(setUsers({ student: students, faculty, all: allUsers }));
    } catch (error: any) {
      toast.error(error.message || "Failed to get data");
    }
  };

  const getAllDepartmentUsers = async (dep: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users?department=${dep}`
      );
      const allUsers = res.data?.users ?? res.data ?? [];

      const students = allUsers.filter((u: any) => u.role === "student");

      dispatch(setUsers({ student: students }));
    } catch (error: any) {
      toast.error(error.message || "Failed to get data");
    }
  };

  // const postUser = async (payload: any) => {
  //   const plainPassword = generateStaticPassword(
  //     payload?.email,
  //     payload?.department
  //   );
  //   const user = {
  //     ...payload,
  //     password: plainPassword,
  //   };

  //   setDataLoading(true);

  //   try {
  //     const res = await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_URL}/auth/users`,
  //       user,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         withCredentials: true,
  //       }
  //     );

  //     const emailPayload = {
  //       to: user?.email,
  //       plainPassword: plainPassword || "",
  //       name: user?.name,
  //       loginUrl: `/login/${user?.role}`,
  //     };

  //     await axios.post("/api/send-password", emailPayload);
  //     if (res) {
  //       toast.success(`${res?.data?.user?.name} Added Successfully!`);
  //     }
  //     if (user?.role === "admin") {
  //       await getAllUsrs();
  //     } else if (user?.role === "faculty") {
  //       await getAllDepartmentUsers(user?.department);
  //     }
  //   } catch (error: any) {
  //     console.error("POST Error:", error);
  //     toast.error(error.response?.data?.message || "Failed to post data");
  //     setDataLoading(false);
  //     throw error;
  //   }
  // };

  const postUser = async (payload: any) => {
    const plainPassword = generateStaticPassword(
      payload?.email,
      payload?.department
    );
    const user = { ...payload, password: plainPassword };

    setDataLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users`,
        user,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const emailPayload = {
        to: user?.email,
        plainPassword: plainPassword || "",
        name: user?.name,
        loginUrl: `/login/${user?.role}`,
      };

      await axios.post("/api/send-password", emailPayload);

      toast.success(`${res?.data?.user?.name} Added Successfully!`);
      window.location.reload();
    } catch (error: any) {
      console.error("POST Error:", error);
      toast.error(error.response?.data?.message || "Failed to post data");
      throw error;
    } finally {
      setDataLoading(false);
    }
  };

  const updateUser = async (id: string, payload: any) => {
    setDataLoading(true);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/${id}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success(`${res?.data?.user?.name || "User"} Updated Successfully!`);
      if (user?.role === "admin") {
        await getAllUsrs();
      } else if (user?.role === "faculty") {
        await getAllDepartmentUsers(user?.department);
      }
    } catch (error: any) {
      console.error("PUT Error:", error);
      toast.error(error.response?.data?.message || "Failed to update data");
      throw error;
    } finally {
      setDataLoading(false);
    }
  };

  // 🔹 DELETE USER
  const deleteUser = async (id: string) => {
    setDataLoading(true);
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/${id}`,
        {
          withCredentials: true,
        }
      );

      toast.success(res?.data?.message || "User Deleted Successfully!");
      if (user?.role === "admin") {
        await getAllUsrs();
      } else if (user?.role === "faculty") {
        await getAllDepartmentUsers(user?.department);
      }
    } catch (error: any) {
      console.error("DELETE Error:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
      throw error;
    } finally {
      setDataLoading(false);
    }
  };

  return {
    getAllUsrs,
    postUser,
    updateUser,
    deleteUser,
    getAllDepartmentUsers,
    dataLoading,
  };
};

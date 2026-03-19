"use client";

import { LoginForm } from "@/components/login-form";
import { PublicRoute } from "@/components/public-route";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

type RoleKey = "student" | "faculty" | "admin";

const content: Record<
  RoleKey,
  { title: string; description: string; defaultEmail: string }
> = {
  student: {
    title: "Student Login",
    description:
      "Access your dashboard to view fines, submit appeals, and track your payment history.",
    defaultEmail: "student@college.edu",
  },
  faculty: {
    title: "Faculty Login",
    description:
      "Manage student fines, verify records, and oversee department-level reports.",
    defaultEmail: "faculty@college.edu",
  },
  admin: {
    title: "Administrator Login",
    description:
      "Oversee the entire fine management system, manage users, and generate reports.",
    defaultEmail: "admin@college.edu",
  },
};

const Login: React.FC = () => {
  const pathname = usePathname() ?? "";

  // derive role from last segment of path (e.g. /login/admin -> "admin")
  const role = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean); // removes empty strings
    const last = parts[parts.length - 1];
    if (last === "admin" || last === "faculty" || last === "student") {
      return last as RoleKey;
    }
    // fallback - if path is /login or unexpected, default to student
    return "student" as RoleKey;
  }, [pathname]);

  // pick content for the derived role
  const { title, description, defaultEmail } = content[role];

  return (
    <PublicRoute>
      <LoginForm title={title} description={description} />
    </PublicRoute>
  );
};

export default Login;

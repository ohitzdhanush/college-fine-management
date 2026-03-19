"use client";

import Admin from "@/components/dashboard/Admin";
import Faculty from "@/components/dashboard/faculty";
import Student from "@/components/dashboard/student";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type RoleKey = "student" | "faculty" | "admin";

const Dashboard = () => {
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

  switch (role) {
    case "student":
      return <Student />;
    case "faculty":
      return <Faculty />;
    case "admin":
      return <Admin />;

    default:
      return <Student />;
  }
  return <div>Dashboard</div>;
};

export default Dashboard;

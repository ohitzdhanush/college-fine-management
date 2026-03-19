// lib/routes.ts
import type { UserRole } from "@/lib/auth-context";

export function roleDefaultRoute(role: UserRole) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "faculty":
      return "/dashboard/faculty";
    case "student":
      return "/dashboard/student";
    default:
      return "/";
  }
}

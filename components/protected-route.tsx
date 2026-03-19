// components/ProtectedRoute.tsx
"use client";

import { useAuth, type UserRole } from "@/lib/auth-context";
import { roleDefaultRoute } from "@/lib/routes";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const LOCAL_TOKEN_KEY = "app_token";

  const hasStoredToken = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(LOCAL_TOKEN_KEY));
  }, []);

  useEffect(() => {
    if (!hasStoredToken && !isAuthenticated) {
      // not logged in at all
      router.replace("/");
      return;
    }

    if (hasStoredToken && !isAuthenticated) {
      // waiting for AuthProvider hydration
      return;
    }

    if (isAuthenticated) {
      if (!user) {
        // still loading user object, wait
        return;
      }

      // if role mismatch => send to their own dashboard
      if (user.role !== requiredRole) {
        router.replace(roleDefaultRoute(user.role));
        return;
      }

      // role matches -> stay on this protected page
    }
  }, [hasStoredToken, isAuthenticated, user, requiredRole, router]);

  if ((hasStoredToken && !isAuthenticated) || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isAuthenticated && user && user.role === requiredRole) {
    return <>{children}</>;
  }

  // fallback loader (should be rare because we redirect above)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}

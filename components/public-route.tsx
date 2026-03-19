// components/PublicRoute.tsx
"use client";

import { useAuth } from "@/lib/auth-context";
import { roleDefaultRoute } from "@/lib/routes";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

/**
 * PublicRoute: Wrap public pages (landing, login). If user is logged in, redirect to their dashboard.
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const LOCAL_TOKEN_KEY = "app_token";
  const hasStoredToken = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(LOCAL_TOKEN_KEY));
  }, []);

  // If we have a token but provider hasn't hydrated yet -> show loader while waiting
  if (hasStoredToken && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If authenticated, redirect to dashboard (use replace to avoid back button landing on login)
  if (isAuthenticated && user) {
    window.location.href = `${roleDefaultRoute(user.role)}`;
    return null;
  }

  // Not authenticated -> show public page
  return <>{children}</>;
}

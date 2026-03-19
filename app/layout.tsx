import { AuthProvider } from "@/lib/auth-context";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type React from "react";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Collage Fine Management System",
  description:
    "A user-friendly Fine Management System designed for colleges to efficiently manage, track, and resolve student fines. Automates fine issuance, notifications, payments, and reporting to streamline administrative processes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ReduxProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReduxProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

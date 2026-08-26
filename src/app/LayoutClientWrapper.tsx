"use client";

import React from "react";
import { UserProvider } from "@/lib/user-store";
import AuthGuard from "@/components/common/AuthGuard";

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AuthGuard>{children}</AuthGuard>
    </UserProvider>
  );
}

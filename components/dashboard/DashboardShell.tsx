"use client";

import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface DashboardShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * Shared dashboard shell component.
 * Provides the sidebar layout structure for both admin and couple dashboards.
 */
export function DashboardShell({ sidebar, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}


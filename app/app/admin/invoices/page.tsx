"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InvoicesPage() {
  return (
    <DashboardShell sidebar={<AdminSidebar />}>
      <DashboardHeader
        breadcrumbs={[
          { label: "Admin", href: "/app/admin" },
          { label: "Invoices" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Platform Invoices</CardTitle>
            <CardDescription>
              Manage Stripe invoices for wedding services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              Invoice management coming soon (Priority 10)
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

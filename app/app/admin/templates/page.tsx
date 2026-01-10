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
import { Badge } from "@/components/ui/badge";
import { templateRegistry } from "@/templates/registry";

export default function TemplatesPage() {
  const templates = Object.values(templateRegistry);

  return (
    <DashboardShell sidebar={<AdminSidebar />}>
      <DashboardHeader
        breadcrumbs={[
          { label: "Admin", href: "/app/admin" },
          { label: "Templates" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Template Registry</CardTitle>
            <CardDescription>
              Available wedding templates and their versions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.metadata.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {template.metadata.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {template.metadata.description}
                        </CardDescription>
                      </div>
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {template.metadata.id}
                      </code>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground">
                        Versions:
                      </span>
                      {template.metadata.versions.map((version) => (
                        <Badge key={version} variant="outline">
                          {version}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

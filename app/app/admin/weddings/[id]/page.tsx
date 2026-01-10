"use client";

import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailsTab } from "@/components/admin/wedding-editor/DetailsTab";
import { TemplateTab } from "@/components/admin/wedding-editor/TemplateTab";
import { SectionsTab } from "@/components/admin/wedding-editor/SectionsTab";
import { ThemeTab } from "@/components/admin/wedding-editor/ThemeTab";
import { GuestsTab } from "@/components/admin/wedding-editor/GuestsTab";
import { LinksTab } from "@/components/admin/wedding-editor/LinksTab";

export default function WeddingEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const weddingId = id as Id<"weddings">;
  const wedding = useQuery(api.weddings.get, { id: weddingId });

  if (wedding === undefined) {
    return (
      <DashboardShell sidebar={<AdminSidebar />}>
        <DashboardHeader
          breadcrumbs={[
            { label: "Admin", href: "/app/admin" },
            { label: "Weddings", href: "/app/admin/weddings" },
            { label: "Loading..." },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!wedding) {
    return (
      <DashboardShell sidebar={<AdminSidebar />}>
        <DashboardHeader
          breadcrumbs={[
            { label: "Admin", href: "/app/admin" },
            { label: "Weddings", href: "/app/admin/weddings" },
            { label: "Not Found" },
          ]}
        />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">Wedding not found</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell sidebar={<AdminSidebar />}>
      <DashboardHeader
        breadcrumbs={[
          { label: "Admin", href: "/app/admin" },
          { label: "Weddings", href: "/app/admin/weddings" },
          { label: wedding.name },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <DetailsTab wedding={wedding} />
          </TabsContent>

          <TabsContent value="template">
            <TemplateTab wedding={wedding} />
          </TabsContent>

          <TabsContent value="sections">
            <SectionsTab wedding={wedding} />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeTab wedding={wedding} />
          </TabsContent>

          <TabsContent value="guests">
            <GuestsTab weddingId={weddingId} />
          </TabsContent>

          <TabsContent value="links">
            <LinksTab wedding={wedding} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

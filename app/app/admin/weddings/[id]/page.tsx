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
import { DesignTab } from "@/components/admin/wedding-editor/DesignTab";
import { FeaturesTab } from "@/components/admin/wedding-editor/FeaturesTab";
import { RsvpTab } from "@/components/admin/wedding-editor/RsvpTab";
import { GiftsTab } from "@/components/admin/wedding-editor/GiftsTab";
import { MediaTab } from "@/components/admin/wedding-editor/MediaTab";
import { DeployTab } from "@/components/admin/wedding-editor/DeployTab";
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
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="rsvp">RSVP</TabsTrigger>
            <TabsTrigger value="gifts">Gifts</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <DetailsTab wedding={wedding} />
          </TabsContent>

          <TabsContent value="design">
            <DesignTab wedding={wedding} />
          </TabsContent>

          <TabsContent value="features">
            <FeaturesTab wedding={wedding} />
          </TabsContent>

          <TabsContent value="rsvp">
            <RsvpTab weddingId={weddingId} />
          </TabsContent>

          <TabsContent value="gifts">
            <GiftsTab weddingId={weddingId} />
          </TabsContent>

          <TabsContent value="media">
            <MediaTab weddingId={weddingId} />
          </TabsContent>

          <TabsContent value="deploy">
            <DeployTab wedding={wedding} />
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

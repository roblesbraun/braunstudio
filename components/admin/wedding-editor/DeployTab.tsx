"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";

function formatTimestamp(timestamp?: number) {
  if (!timestamp) return "Not deployed";
  return new Date(timestamp).toLocaleString();
}

export function DeployTab({ wedding }: { wedding: Doc<"weddings"> }) {
  const deployLive = useMutation(api.weddings.deployLive);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await deployLive({ id: wedding._id });
      toast.success("Wedding deployed live");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to deploy wedding"
      );
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment</CardTitle>
        <CardDescription>
          Manage preview and production deployment state.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current State</span>
            <span className="text-sm capitalize">
              {wedding.deployment.state}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Deployed At</span>
            <span className="text-sm text-muted-foreground">
              {formatTimestamp(wedding.deployment.deployedAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={`/preview/${wedding.slug}`} target="_blank" rel="noreferrer">
              Preview
            </a>
          </Button>
          {wedding.deployment.state === "live" && (
            <Button variant="outline" asChild>
              <a
                href={`https://${wedding.slug}.braunstud.io`}
                target="_blank"
                rel="noreferrer"
              >
                Live Site
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        <Button
          onClick={handleDeploy}
          disabled={isDeploying || wedding.deployment.state === "live"}
        >
          {isDeploying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Deploy Live
        </Button>
      </CardContent>
    </Card>
  );
}

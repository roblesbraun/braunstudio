"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Smart redirect page for /app route.
 * Redirects platform admins to /app/admin and couples to /app/couple.
 */
export default function AppRedirectPage() {
  const router = useRouter();
  const user = useQuery(api.users.viewer);

  useEffect(() => {
    if (user === undefined) {
      // Still loading
      return;
    }

    if (!user) {
      // Not authenticated - redirect to login
      router.push("/login");
      return;
    }

    // Check if email is in admin allowlist (client-side check)
    const adminEmails = (
      process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS || ""
    )
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      router.push("/app/admin");
    } else {
      router.push("/app/couple");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}

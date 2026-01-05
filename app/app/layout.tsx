import { ReactNode } from "react";

/**
 * Layout for the /app/* routes (admin and couple dashboards).
 * This is a protected area - middleware ensures authentication.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}


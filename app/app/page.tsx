import { redirect } from "next/navigation";

// Platform app root redirects to sign-in (or dashboard if authenticated)
export default function PlatformAppPage() {
    redirect("/sign-in");
}

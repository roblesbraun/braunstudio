"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/app/sign-in");
    }, [router]);

    return (
        <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-muted-foreground">Redirecting...</div>
        </main>
    );
}

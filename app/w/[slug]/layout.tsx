import { ReactNode } from "react";

interface WeddingLayoutProps {
    children: ReactNode;
    params: Promise<{ slug: string }>;
}

export default async function WeddingLayout({ children }: WeddingLayoutProps) {
    return <div className="min-h-screen">{children}</div>;
}

"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) return null;
    return new ConvexReactClient(url);
  }, []);

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card max-w-md w-full p-6">
          <h1 className="text-lg font-medium mb-2">Convex Not Configured</h1>
          <p className="text-sm text-ink-600 leading-relaxed">
            Set <code className="text-ink-900">NEXT_PUBLIC_CONVEX_URL</code> in{" "}
            <code className="text-ink-900">.env.local</code>, then reload this
            page.
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

"use client";

import Chat from "@/components/chat";
import { ErrorBoundary } from "@/components/error-boundary";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const presetId = searchParams.get('preset');

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Home page error:', error, errorInfo);
      }}
    >
      <Chat presetId={presetId} />
    </ErrorBoundary>
  );
}

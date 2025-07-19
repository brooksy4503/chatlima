"use client";

import Chat from "@/components/chat";
import { ErrorBoundary } from "@/components/error-boundary";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChatWithPresets() {
  const searchParams = useSearchParams();
  const presetId = searchParams.get('preset');
  
  return <Chat presetId={presetId} />;
}

export default function Page() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Home page error:', error, errorInfo);
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ChatWithPresets />
      </Suspense>
    </ErrorBoundary>
  );
}

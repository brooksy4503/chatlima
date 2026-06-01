"use client";

import Chat from "@/components/chat";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";

export default function Page() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Home page error:', error, errorInfo);
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <Chat />
      </Suspense>
    </ErrorBoundary>
  );
}

"use client";

import Chat from "@/components/chat";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Page() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Home page error:', error, errorInfo);
      }}
    >
      <Chat />
    </ErrorBoundary>
  );
}

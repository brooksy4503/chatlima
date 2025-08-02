import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function SessionTestPage() {
  const headersList = await headers();
  
  // Convert ReadonlyHeaders to Headers
  const requestHeaders = new Headers();
  headersList.forEach((value, key) => {
    requestHeaders.set(key, value);
  });
  
  const session = await auth.api.getSession({ headers: requestHeaders });

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
} 
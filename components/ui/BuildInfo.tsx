export default function BuildInfo() {
  const commit = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';
    const url = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || 'unknown';

  return (
    <div style={{ fontSize: 12, color: '#888', textAlign: 'center', padding: '8px 0' }}>
      <span>Commit: {commit} | URL: {url}</span>
    </div>
  );
} 